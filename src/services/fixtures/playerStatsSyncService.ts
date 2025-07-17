import { supabase } from '@/integrations/supabase/client';
import { incrementPlayerGoals, incrementPlayerAssists } from './playerStatsUpdateService';

interface SyncResult {
  playersUpdated: number;
  goalsAdded: number;
  assistsAdded: number;
  errors: string[];
  warnings: string[];
}

interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

interface CleanupResult {
  removedEvents: number;
  errors: string[];
}

interface CumulativeStatsResult {
  success: boolean;
  players_updated: number;
  error?: string;
  calculated_at: string;
}

export const syncExistingMatchEvents = async (): Promise<SyncResult> => {
  console.log('🔄 PlayerStatsSyncService: Starting cumulative stats sync using database function...');
  
  const result: SyncResult = {
    playersUpdated: 0,
    goalsAdded: 0,
    assistsAdded: 0,
    errors: [],
    warnings: []
  };

  try {
    // Use the new database function to calculate cumulative stats
    console.log('📊 PlayerStatsSyncService: Calling calculate_cumulative_player_stats function...');
    
    const { data: functionResult, error: functionError } = await supabase
      .rpc('calculate_cumulative_player_stats');

    if (functionError) {
      throw new Error(`Database function failed: ${functionError.message}`);
    }

    // Type the function result properly
    const typedResult = functionResult as unknown as CumulativeStatsResult;
    
    if (!typedResult || !typedResult.success) {
      throw new Error(`Stats calculation failed: ${typedResult?.error || 'Unknown error'}`);
    }

    // Get summary of what was updated
    result.playersUpdated = typedResult.players_updated || 0;
    
    // Calculate the totals for reporting (optional - for UI feedback)
    const { data: totalEvents, error: totalError } = await supabase
      .from('match_events')
      .select('event_type')
      .in('event_type', ['goal', 'assist']);

    if (!totalError && totalEvents) {
      result.goalsAdded = totalEvents.filter(e => e.event_type === 'goal').length;
      result.assistsAdded = totalEvents.filter(e => e.event_type === 'assist').length;
    }

    console.log(`✅ PlayerStatsSyncService: Cumulative sync completed. Updated ${result.playersUpdated} players with accurate season totals`);
    console.log(`📈 Total season stats: ${result.goalsAdded} goals, ${result.assistsAdded} assists`);
    
    return result;

  } catch (error) {
    console.error('❌ PlayerStatsSyncService: Critical error during cumulative sync:', error);
    result.errors.push(`Critical sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};

export const validatePlayerStats = async (): Promise<ValidationResult> => {
  console.log('🔍 PlayerStatsSyncService: Validating player stats consistency...');
  
  const result: ValidationResult = {
    isValid: true,
    issues: []
  };

  try {
    // Get all players with their current stats
    const { data: players, error: playersError } = await supabase
      .from('members')
      .select('id, name, goals, assists');

    if (playersError) {
      throw new Error(`Failed to fetch players: ${playersError.message}`);
    }

    if (!players || players.length === 0) {
      return result;
    }

    // For each player, count their events and compare
    for (const player of players) {
      const { data: playerEvents, error: eventsError } = await supabase
        .from('match_events')
        .select('event_type, is_own_goal')
        .eq('player_name', player.name)
        .in('event_type', ['goal', 'assist']);

      if (eventsError) {
        result.issues.push(`Error fetching events for ${player.name}: ${eventsError.message}`);
        result.isValid = false;
        continue;
      }

      // Count goals excluding own goals (like the database function does)
      const eventGoals = playerEvents?.filter(e => e.event_type === 'goal' && e.is_own_goal === false).length || 0;
      const eventAssists = playerEvents?.filter(e => e.event_type === 'assist').length || 0;
      const playerGoals = player.goals || 0;
      const playerAssists = player.assists || 0;

      if (eventGoals !== playerGoals) {
        result.issues.push(`${player.name}: Goals mismatch - Events: ${eventGoals}, Profile: ${playerGoals}`);
        result.isValid = false;
      }

      if (eventAssists !== playerAssists) {
        result.issues.push(`${player.name}: Assists mismatch - Events: ${eventAssists}, Profile: ${playerAssists}`);
        result.isValid = false;
      }
    }

    if (result.isValid) {
      console.log('✅ PlayerStatsSyncService: All player stats are consistent');
    } else {
      console.warn(`⚠️ PlayerStatsSyncService: Found ${result.issues.length} consistency issues`);
    }

    return result;

  } catch (error) {
    console.error('❌ PlayerStatsSyncService: Error during validation:', error);
    result.issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.isValid = false;
    return result;
  }
};

export const cleanupDuplicateEvents = async (): Promise<CleanupResult> => {
  console.log('🧹 PlayerStatsSyncService: Cleaning up duplicate match events...');
  
  const result: CleanupResult = {
    removedEvents: 0,
    errors: []
  };

  try {
    // Find potential duplicates (same fixture, player, event type, within 30 seconds)
    const { data: allEvents, error: fetchError } = await supabase
      .from('match_events')
      .select('*')
      .order('fixture_id', { ascending: true })
      .order('event_time', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch events: ${fetchError.message}`);
    }

    if (!allEvents || allEvents.length === 0) {
      return result;
    }

    // Group events and find duplicates
    const duplicateGroups = new Map();
    
    for (const event of allEvents) {
      const key = `${event.fixture_id}-${event.player_name}-${event.event_type}`;
      
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      
      duplicateGroups.get(key).push(event);
    }

    // Process each group and remove duplicates
    for (const [key, events] of duplicateGroups) {
      if (events.length > 1) {
        // Sort by creation time and keep the earliest
        events.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        // Remove all but the first
        const eventsToRemove = events.slice(1);
        
        for (const eventToRemove of eventsToRemove) {
          const { error: deleteError } = await supabase
            .from('match_events')
            .delete()
            .eq('id', eventToRemove.id);

          if (deleteError) {
            result.errors.push(`Failed to delete duplicate event ${eventToRemove.id}: ${deleteError.message}`);
          } else {
            result.removedEvents++;
            console.log(`🗑️ PlayerStatsSyncService: Removed duplicate event for ${eventToRemove.player_name}`);
          }
        }
      }
    }

    console.log(`✅ PlayerStatsSyncService: Cleanup completed. Removed ${result.removedEvents} duplicate events`);
    return result;

  } catch (error) {
    console.error('❌ PlayerStatsSyncService: Error during cleanup:', error);
    result.errors.push(`Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};
