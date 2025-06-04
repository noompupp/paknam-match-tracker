import { supabase } from '@/integrations/supabase/client';
import { validateAndSyncPlayerStats } from './playerStatsUpdateService';

interface SyncResult {
  success: boolean;
  playersProcessed: number;
  playersUpdated: number;
  goalsFixed: number;
  assistsFixed: number;
  errors: string[];
  warnings: string[];
  summary: string;
}

export const comprehensiveDataSyncService = {
  async performFullDataSync(): Promise<SyncResult> {
    console.log('🔄 ComprehensiveDataSyncService: Starting full data synchronization...');
    
    const result: SyncResult = {
      success: false,
      playersProcessed: 0,
      playersUpdated: 0,
      goalsFixed: 0,
      assistsFixed: 0,
      errors: [],
      warnings: [],
      summary: ''
    };

    try {
      // Step 1: Get all players
      const { data: allPlayers, error: playersError } = await supabase
        .from('members')
        .select('id, name, goals, assists')
        .order('name');

      if (playersError) {
        throw new Error(`Failed to fetch players: ${playersError.message}`);
      }

      if (!allPlayers || allPlayers.length === 0) {
        result.summary = 'No players found to synchronize';
        result.success = true;
        return result;
      }

      console.log(`📊 ComprehensiveDataSyncService: Processing ${allPlayers.length} players...`);

      // Step 2: Process each player
      for (const player of allPlayers) {
        result.playersProcessed++;
        
        try {
          // Count actual events for this player
          const { data: goalEvents, error: goalError } = await supabase
            .from('match_events')
            .select('id')
            .eq('player_name', player.name)
            .eq('event_type', 'goal');

          const { data: assistEvents, error: assistError } = await supabase
            .from('match_events')
            .select('id')
            .eq('player_name', player.name)
            .eq('event_type', 'assist');

          if (goalError || assistError) {
            result.errors.push(`Error fetching events for ${player.name}`);
            continue;
          }

          const actualGoals = goalEvents?.length || 0;
          const actualAssists = assistEvents?.length || 0;
          const currentGoals = player.goals || 0;
          const currentAssists = player.assists || 0;

          // Check if update is needed
          const needsUpdate = actualGoals !== currentGoals || actualAssists !== currentAssists;

          if (needsUpdate) {
            console.log(`🔧 ComprehensiveDataSyncService: Fixing stats for ${player.name}:`, {
              goals: `${currentGoals} → ${actualGoals}`,
              assists: `${currentAssists} → ${actualAssists}`
            });

            // Update player stats
            const { error: updateError } = await supabase
              .from('members')
              .update({
                goals: actualGoals,
                assists: actualAssists
              })
              .eq('id', player.id);

            if (updateError) {
              result.errors.push(`Failed to update ${player.name}: ${updateError.message}`);
            } else {
              result.playersUpdated++;
              result.goalsFixed += Math.abs(actualGoals - currentGoals);
              result.assistsFixed += Math.abs(actualAssists - currentAssists);
              console.log(`✅ ComprehensiveDataSyncService: Updated ${player.name} successfully`);
            }
          } else {
            console.log(`✅ ComprehensiveDataSyncService: ${player.name} stats already correct`);
          }

        } catch (error) {
          result.errors.push(`Error processing ${player.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Step 3: Clean up duplicate events
      await this.cleanupDuplicateEvents(result);

      // Step 4: Generate summary
      result.success = result.errors.length === 0;
      result.summary = this.generateSyncSummary(result);

      console.log(`✅ ComprehensiveDataSyncService: Synchronization completed:`, result);
      return result;

    } catch (error) {
      console.error('❌ ComprehensiveDataSyncService: Critical error during sync:', error);
      result.errors.push(`Critical sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.summary = 'Synchronization failed due to critical errors';
      return result;
    }
  },

  async cleanupDuplicateEvents(result: SyncResult): Promise<void> {
    console.log('🧹 ComprehensiveDataSyncService: Cleaning up duplicate events...');
    
    try {
      // Find potential duplicates
      const { data: allEvents, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .in('event_type', ['goal', 'assist'])
        .order('fixture_id')
        .order('event_time');

      if (eventsError) {
        result.warnings.push(`Error fetching events for cleanup: ${eventsError.message}`);
        return;
      }

      if (!allEvents || allEvents.length === 0) {
        return;
      }

      // Group events by potential duplicate criteria
      const eventGroups = new Map<string, any[]>();
      
      for (const event of allEvents) {
        const key = `${event.fixture_id}-${event.player_name}-${event.event_type}-${Math.floor(event.event_time / 30)}`;
        
        if (!eventGroups.has(key)) {
          eventGroups.set(key, []);
        }
        
        eventGroups.get(key)!.push(event);
      }

      // Remove duplicates (keep the earliest)
      let duplicatesRemoved = 0;
      
      for (const [key, events] of eventGroups) {
        if (events.length > 1) {
          // Sort by creation time and keep the first
          events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          const eventsToRemove = events.slice(1);
          
          for (const eventToRemove of eventsToRemove) {
            const { error: deleteError } = await supabase
              .from('match_events')
              .delete()
              .eq('id', eventToRemove.id);

            if (deleteError) {
              result.warnings.push(`Failed to delete duplicate event: ${deleteError.message}`);
            } else {
              duplicatesRemoved++;
            }
          }
        }
      }

      if (duplicatesRemoved > 0) {
        console.log(`🗑️ ComprehensiveDataSyncService: Removed ${duplicatesRemoved} duplicate events`);
        result.warnings.push(`Removed ${duplicatesRemoved} duplicate events`);
      }

    } catch (error) {
      result.warnings.push(`Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  generateSyncSummary(result: SyncResult): string {
    const parts = [];
    
    parts.push(`Processed ${result.playersProcessed} players`);
    
    if (result.playersUpdated > 0) {
      parts.push(`Updated ${result.playersUpdated} players`);
    }
    
    if (result.goalsFixed > 0) {
      parts.push(`Fixed ${result.goalsFixed} goal discrepancies`);
    }
    
    if (result.assistsFixed > 0) {
      parts.push(`Fixed ${result.assistsFixed} assist discrepancies`);
    }
    
    if (result.errors.length > 0) {
      parts.push(`${result.errors.length} errors occurred`);
    }
    
    if (result.warnings.length > 0) {
      parts.push(`${result.warnings.length} warnings`);
    }
    
    return parts.length > 0 
      ? `Data synchronization completed: ${parts.join(', ')}`
      : 'Data synchronization completed with no changes needed';
  },

  async validateAllPlayerStats(): Promise<{ valid: number; invalid: number; issues: string[] }> {
    console.log('🔍 ComprehensiveDataSyncService: Validating all player stats...');
    
    const validationResult = { valid: 0, invalid: 0, issues: [] as string[] };
    
    try {
      const { data: allPlayers, error } = await supabase
        .from('members')
        .select('id, name');

      if (error || !allPlayers) {
        validationResult.issues.push('Failed to fetch players for validation');
        return validationResult;
      }

      for (const player of allPlayers) {
        const result = await validateAndSyncPlayerStats(player.id);
        
        if (result.isValid) {
          validationResult.valid++;
        } else {
          validationResult.invalid++;
          validationResult.issues.push(...result.issues);
        }
      }

      console.log(`📊 ComprehensiveDataSyncService: Validation complete - Valid: ${validationResult.valid}, Invalid: ${validationResult.invalid}`);
      return validationResult;

    } catch (error) {
      validationResult.issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return validationResult;
    }
  }
};
