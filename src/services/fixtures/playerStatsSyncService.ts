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

export const syncExistingMatchEvents = async (): Promise<SyncResult> => {
  console.log('🔄 PlayerStatsSyncService: Starting comprehensive sync of existing match events...');
  
  const result: SyncResult = {
    playersUpdated: 0,
    goalsAdded: 0,
    assistsAdded: 0,
    errors: [],
    warnings: []
  };

  try {
    // Get all match events that affect player stats
    const { data: events, error: eventsError } = await supabase
      .from('match_events')
      .select(`
        id,
        fixture_id,
        event_type,
        player_name,
        team_id,
        event_time,
        description
      `)
      .in('event_type', ['goal', 'assist'])
      .order('fixture_id', { ascending: true })
      .order('event_time', { ascending: true });

    if (eventsError) {
      throw new Error(`Failed to fetch match events: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      console.log('✅ PlayerStatsSyncService: No match events found to sync');
      return result;
    }

    console.log(`📊 PlayerStatsSyncService: Found ${events.length} events to process`);

    // Group events by player name to batch updates
    const playerEvents = new Map<string, { goals: number; assists: number; playerId?: number }>();

    for (const event of events) {
      if (!playerEvents.has(event.player_name)) {
        playerEvents.set(event.player_name, { goals: 0, assists: 0 });
      }

      const playerData = playerEvents.get(event.player_name)!;
      
      if (event.event_type === 'goal') {
        playerData.goals++;
        result.goalsAdded++;
      } else if (event.event_type === 'assist') {
        playerData.assists++;
        result.assistsAdded++;
      }
    }

    // Find player IDs and update stats
    for (const [playerName, stats] of playerEvents) {
      try {
        // Find player in database
        const { data: players, error: playerError } = await supabase
          .from('members')
          .select('id, name, goals, assists')
          .ilike('name', playerName)
          .limit(1);

        if (playerError) {
          result.errors.push(`Error finding player "${playerName}": ${playerError.message}`);
          continue;
        }

        if (!players || players.length === 0) {
          result.warnings.push(`Player "${playerName}" not found in members table`);
          continue;
        }

        const player = players[0];
        const currentGoals = player.goals || 0;
        const currentAssists = player.assists || 0;

        // Calculate expected totals based on events
        const expectedGoals = stats.goals;
        const expectedAssists = stats.assists;

        // Only update if there's a difference
        let needsUpdate = false;
        let goalsDiff = 0;
        let assistsDiff = 0;

        if (currentGoals !== expectedGoals) {
          goalsDiff = expectedGoals - currentGoals;
          needsUpdate = true;
        }

        if (currentAssists !== expectedAssists) {
          assistsDiff = expectedAssists - currentAssists;
          needsUpdate = true;
        }

        if (needsUpdate) {
          // Update player stats to match events
          const { error: updateError } = await supabase
            .from('members')
            .update({
              goals: expectedGoals,
              assists: expectedAssists
            })
            .eq('id', player.id);

          if (updateError) {
            result.errors.push(`Error updating player "${playerName}": ${updateError.message}`);
          } else {
            result.playersUpdated++;
            console.log(`✅ PlayerStatsSyncService: Updated ${playerName}: goals ${currentGoals} → ${expectedGoals}, assists ${currentAssists} → ${expectedAssists}`);
          }
        } else {
          console.log(`✅ PlayerStatsSyncService: Player "${playerName}" stats already correct`);
        }

      } catch (error) {
        result.errors.push(`Unexpected error processing player "${playerName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ PlayerStatsSyncService: Sync completed. Updated ${result.playersUpdated} players`);
    return result;

  } catch (error) {
    console.error('❌ PlayerStatsSyncService: Critical error during sync:', error);
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
        .select('event_type')
        .eq('player_name', player.name)
        .in('event_type', ['goal', 'assist']);

      if (eventsError) {
        result.issues.push(`Error fetching events for ${player.name}: ${eventsError.message}`);
        result.isValid = false;
        continue;
      }

      const eventGoals = playerEvents?.filter(e => e.event_type === 'goal').length || 0;
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
