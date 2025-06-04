import { supabase } from '@/integrations/supabase/client';

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingEventId?: number;
  message?: string;
}

export const duplicatePreventionService = {
  async checkGoalEventDuplicate(
    fixtureId: number,
    teamId: number,
    playerName: string,
    eventTime: number
  ): Promise<DuplicateCheckResult> {
    console.log('🔍 DuplicatePreventionService: Checking for goal event duplicates:', {
      fixtureId,
      teamId,
      playerName,
      eventTime
    });

    try {
      const { data: existingEvents, error } = await supabase
        .from('match_events')
        .select('id, player_name, event_time')
        .eq('fixture_id', fixtureId)
        .eq('team_id', teamId)
        .eq('event_type', 'goal')
        .eq('player_name', playerName)
        .eq('event_time', eventTime);

      if (error) {
        console.error('❌ DuplicatePreventionService: Error checking duplicates:', error);
        return { isDuplicate: false, message: 'Error checking for duplicates' };
      }

      if (existingEvents && existingEvents.length > 0) {
        console.log('⚠️ DuplicatePreventionService: Duplicate goal event found:', existingEvents[0]);
        return {
          isDuplicate: true,
          existingEventId: existingEvents[0].id,
          message: `Goal already assigned to ${playerName} at ${eventTime} seconds`
        };
      }

      console.log('✅ DuplicatePreventionService: No duplicates found');
      return { isDuplicate: false };

    } catch (error) {
      console.error('❌ DuplicatePreventionService: Critical error:', error);
      return { isDuplicate: false, message: 'Critical error checking duplicates' };
    }
  },

  async cleanupDuplicateGoalEvents(fixtureId: number): Promise<{ removedCount: number; errors: string[] }> {
    console.log('🧹 DuplicatePreventionService: Cleaning up duplicate goal events for fixture:', fixtureId);
    
    const result = { removedCount: 0, errors: [] };

    try {
      // Get all goal events for this fixture
      const { data: events, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .order('created_at', { ascending: true });

      if (error) {
        result.errors.push(`Error fetching events: ${error.message}`);
        return result;
      }

      if (!events || events.length === 0) {
        console.log('📊 DuplicatePreventionService: No goal events found for cleanup');
        return result;
      }

      // Group events by team_id, player_name, and event_time
      const eventGroups = new Map<string, any[]>();
      
      for (const event of events) {
        const key = `${event.team_id}-${event.player_name}-${event.event_time}`;
        if (!eventGroups.has(key)) {
          eventGroups.set(key, []);
        }
        eventGroups.get(key)!.push(event);
      }

      // Remove duplicates (keep the first one, remove the rest)
      for (const [key, groupEvents] of eventGroups) {
        if (groupEvents.length > 1) {
          console.log(`🗑️ DuplicatePreventionService: Found ${groupEvents.length} duplicates for key: ${key}`);
          
          // Keep the first event, remove the rest
          const eventsToRemove = groupEvents.slice(1);
          
          for (const eventToRemove of eventsToRemove) {
            try {
              const { error: deleteError } = await supabase
                .from('match_events')
                .delete()
                .eq('id', eventToRemove.id);

              if (deleteError) {
                result.errors.push(`Failed to delete event ${eventToRemove.id}: ${deleteError.message}`);
              } else {
                result.removedCount++;
                console.log(`✅ DuplicatePreventionService: Removed duplicate event:`, eventToRemove);
              }
            } catch (error) {
              result.errors.push(`Error deleting event ${eventToRemove.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      }

      console.log(`✅ DuplicatePreventionService: Cleanup completed. Removed ${result.removedCount} duplicates`);
      return result;

    } catch (error) {
      console.error('❌ DuplicatePreventionService: Critical error during cleanup:', error);
      result.errors.push(`Critical cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }
};
