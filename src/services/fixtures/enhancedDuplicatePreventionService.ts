
import { supabase } from '@/integrations/supabase/client';

interface DuplicateCheckParams {
  fixtureId: number;
  teamId: string; // Changed from number to string
  playerName: string;
  eventTime: number;
  eventType: 'goal' | 'assist' | 'yellow' | 'red';
  isOwnGoal?: boolean; // Add own goal support for duplicate checking
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  message?: string;
  conflictingEvents?: any[];
}

export const enhancedDuplicatePreventionService = {
  async checkForDuplicateEvent(params: DuplicateCheckParams): Promise<DuplicateCheckResult> {
    console.log('🔍 EnhancedDuplicatePreventionService: Checking for duplicate event with own goal support:', params);
    
    try {
      const { data: existingEvents, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', params.fixtureId)
        .eq('team_id', params.teamId)
        .eq('player_name', params.playerName)
        .eq('event_type', params.eventType)
        .eq('event_time', params.eventTime)
        .eq('is_own_goal', params.isOwnGoal || false); // Include own goal in duplicate check

      if (error) {
        console.error('❌ EnhancedDuplicatePreventionService: Error checking duplicates:', error);
        return { isDuplicate: false };
      }

      const isDuplicate = existingEvents && existingEvents.length > 0;
      
      if (isDuplicate) {
        console.warn('⚠️ EnhancedDuplicatePreventionService: Duplicate event detected:', existingEvents);
        return {
          isDuplicate: true,
          message: `Duplicate ${params.eventType}${params.isOwnGoal ? ' (own goal)' : ''} already exists for ${params.playerName} at time ${params.eventTime}`,
          conflictingEvents: existingEvents
        };
      }

      return { isDuplicate: false };

    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Error in checkForDuplicateEvent:', error);
      return { isDuplicate: false };
    }
  },

  async preventDuplicateGoalEvent(fixtureId: number, teamId: string, playerName: string): Promise<boolean> {
    console.log('🛡️ EnhancedDuplicatePreventionService: Preventing duplicate goal event');
    
    try {
      const { data: existingGoals, error } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('team_id', teamId)
        .eq('player_name', playerName)
        .eq('event_type', 'goal');

      if (error) {
        console.error('❌ EnhancedDuplicatePreventionService: Error checking goal duplicates:', error);
        return true; // Allow creation if we can't check
      }

      const hasExistingGoal = existingGoals && existingGoals.length > 0;
      
      if (hasExistingGoal) {
        console.warn('⚠️ EnhancedDuplicatePreventionService: Duplicate goal prevented for:', playerName);
        return false;
      }

      return true;

    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Error in preventDuplicateGoalEvent:', error);
      return true; // Allow creation if we can't check
    }
  },

  async cleanupAllDuplicateEvents(): Promise<{ removedCount: number; errors: string[] }> {
    console.log('🧹 EnhancedDuplicatePreventionService: Starting comprehensive duplicate cleanup...');
    
    const result = { removedCount: 0, errors: [] as string[] };

    try {
      // Get all fixtures to process
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select('id');

      if (fixturesError) {
        result.errors.push(`Error fetching fixtures: ${fixturesError.message}`);
        return result;
      }

      if (!fixtures || fixtures.length === 0) {
        console.log('📊 EnhancedDuplicatePreventionService: No fixtures found for cleanup');
        return result;
      }

      // Process each fixture
      for (const fixture of fixtures) {
        try {
          const fixtureResult = await this.cleanupFixtureDuplicates(fixture.id);
          result.removedCount += fixtureResult.removedCount;
          result.errors.push(...fixtureResult.errors);
        } catch (error) {
          const errorMsg = `Error cleaning fixture ${fixture.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }

      console.log(`✅ EnhancedDuplicatePreventionService: Cleanup completed. Removed ${result.removedCount} duplicates with ${result.errors.length} errors`);
      
    } catch (error) {
      const errorMsg = `Critical error in cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      console.error('❌ EnhancedDuplicatePreventionService:', errorMsg);
    }

    return result;
  },

  async cleanupFixtureDuplicates(fixtureId: number): Promise<{ removedCount: number; errors: string[] }> {
    console.log(`🧹 EnhancedDuplicatePreventionService: Cleaning duplicates for fixture ${fixtureId}`);
    
    const result = { removedCount: 0, errors: [] as string[] };

    try {
      // Find duplicate events (same fixture, player, event type, and time)
      const { data: events, error: fetchError } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        result.errors.push(`Error fetching events for fixture ${fixtureId}: ${fetchError.message}`);
        return result;
      }

      if (!events || events.length === 0) {
        return result;
      }

      // Group events by player, event type, and time to find duplicates
      const eventGroups = new Map<string, any[]>();
      
      events.forEach(event => {
        const key = `${event.player_name}-${event.event_type}-${event.event_time}-${event.team_id}`;
        if (!eventGroups.has(key)) {
          eventGroups.set(key, []);
        }
        eventGroups.get(key)!.push(event);
      });

      // Remove duplicates (keep the first event, remove the rest)
      for (const [key, duplicates] of eventGroups) {
        if (duplicates.length > 1) {
          console.log(`🔍 Found ${duplicates.length} duplicates for: ${key}`);
          
          // Keep the first event, remove the rest
          const toRemove = duplicates.slice(1);
          const idsToRemove = toRemove.map(event => event.id);
          
          if (idsToRemove.length > 0) {
            const { error: deleteError } = await supabase
              .from('match_events')
              .delete()
              .in('id', idsToRemove);

            if (deleteError) {
              result.errors.push(`Error removing duplicates for ${key}: ${deleteError.message}`);
            } else {
              result.removedCount += idsToRemove.length;
              console.log(`✅ Removed ${idsToRemove.length} duplicates for: ${key}`);
            }
          }
        }
      }

      // Also remove any "Unknown Player" events that might have been created
      const { data: unknownEvents, error: unknownError } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('player_name', 'Unknown Player');

      if (!unknownError && unknownEvents && unknownEvents.length > 0) {
        const { error: deleteUnknownError } = await supabase
          .from('match_events')
          .delete()
          .in('id', unknownEvents.map(e => e.id));

        if (deleteUnknownError) {
          result.errors.push(`Error removing Unknown Player events: ${deleteUnknownError.message}`);
        } else {
          result.removedCount += unknownEvents.length;
          console.log(`✅ Removed ${unknownEvents.length} Unknown Player events`);
        }
      }

    } catch (error) {
      const errorMsg = `Error in cleanupFixtureDuplicates for ${fixtureId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      console.error('❌ EnhancedDuplicatePreventionService:', errorMsg);
    }

    return result;
  }
};
