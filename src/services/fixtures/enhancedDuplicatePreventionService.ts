import { supabase } from '@/integrations/supabase/client';

interface DuplicateCheckParams {
  fixtureId: number;
  teamId: number;
  playerName: string;
  eventTime: number;
  eventType: string;
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  message?: string;
  existingEvents?: any[];
}

interface CleanupResult {
  removedCount: number;
  errors: string[];
}

export const enhancedDuplicatePreventionService = {
  async checkForDuplicateEvent(params: DuplicateCheckParams): Promise<DuplicateCheckResult> {
    console.log('🔍 EnhancedDuplicatePreventionService: Checking for duplicate event:', params);
    
    try {
      const { fixtureId, teamId, playerName, eventTime, eventType } = params;
      
      // Check for exact duplicates within a 30-second window
      const timeWindow = 30;
      const { data: existingEvents, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .eq('team_id', teamId)
        .eq('player_name', playerName)
        .eq('event_type', eventType)
        .gte('event_time', eventTime - timeWindow)
        .lte('event_time', eventTime + timeWindow);

      if (error) {
        console.error('❌ EnhancedDuplicatePreventionService: Error checking duplicates:', error);
        return { isDuplicate: false };
      }

      if (existingEvents && existingEvents.length > 0) {
        console.warn('⚠️ EnhancedDuplicatePreventionService: Duplicate event detected:', existingEvents);
        return {
          isDuplicate: true,
          message: `Duplicate ${eventType} event for ${playerName} already exists within 30 seconds`,
          existingEvents
        };
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Error in duplicate check:', error);
      return { isDuplicate: false };
    }
  },

  async cleanupAllDuplicateEvents(): Promise<CleanupResult> {
    console.log('🧹 EnhancedDuplicatePreventionService: Starting comprehensive duplicate cleanup...');
    
    const result: CleanupResult = {
      removedCount: 0,
      errors: []
    };

    try {
      // Find exact duplicates
      const { data: duplicates, error: findError } = await supabase.rpc('find_duplicate_events');
      
      if (findError) {
        console.error('❌ EnhancedDuplicatePreventionService: Error finding duplicates:', findError);
        result.errors.push(`Failed to find duplicates: ${findError.message}`);
        return result;
      }

      if (!duplicates || duplicates.length === 0) {
        console.log('✅ EnhancedDuplicatePreventionService: No duplicates found');
        return result;
      }

      // Group duplicates and keep only the first occurrence
      const duplicateGroups = new Map();
      duplicates.forEach((event: any) => {
        const key = `${event.fixture_id}-${event.team_id}-${event.player_name}-${event.event_type}-${event.event_time}`;
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key).push(event);
      });

      // Remove duplicates (keep first, remove rest)
      for (const [key, events] of duplicateGroups) {
        if (events.length > 1) {
          const eventsToRemove = events.slice(1); // Keep first, remove rest
          
          for (const eventToRemove of eventsToRemove) {
            const { error: deleteError } = await supabase
              .from('match_events')
              .delete()
              .eq('id', eventToRemove.id);

            if (deleteError) {
              result.errors.push(`Failed to delete event ${eventToRemove.id}: ${deleteError.message}`);
            } else {
              result.removedCount++;
            }
          }
        }
      }

      console.log(`✅ EnhancedDuplicatePreventionService: Cleanup completed. Removed ${result.removedCount} duplicates`);
      return result;

    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Critical error during cleanup:', error);
      result.errors.push(`Critical cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  },

  async preventDuplicateGoalAssignment(fixtureId: number, playerName: string, eventType: 'goal' | 'assist', eventTime: number): Promise<boolean> {
    console.log('⚽ EnhancedDuplicatePreventionService: Checking goal assignment duplication...');
    
    try {
      const { data: existing, error } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('player_name', playerName)
        .eq('event_type', eventType)
        .gte('event_time', eventTime - 10) // 10 second window
        .lte('event_time', eventTime + 10);

      if (error) {
        console.error('❌ EnhancedDuplicatePreventionService: Error checking goal duplicates:', error);
        return false;
      }

      const isDuplicate = existing && existing.length > 0;
      
      if (isDuplicate) {
        console.warn('⚠️ EnhancedDuplicatePreventionService: Duplicate goal assignment prevented');
      }

      return isDuplicate;
    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Error in goal duplicate check:', error);
      return false;
    }
  }
};
