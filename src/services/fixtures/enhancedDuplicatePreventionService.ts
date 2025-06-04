import { supabase } from '@/integrations/supabase/client';

interface DuplicateCheckParams {
  fixtureId: number;
  teamId: number;
  playerName: string;
  eventTime: number;
  eventType: 'goal' | 'assist' | 'yellow_card' | 'red_card';
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingEventId?: number;
  message?: string;
  duplicateCount?: number;
}

export const enhancedDuplicatePreventionService = {
  async checkForDuplicateEvent(params: DuplicateCheckParams): Promise<DuplicateCheckResult> {
    console.log('🔍 EnhancedDuplicatePreventionService: Checking for duplicates:', params);

    try {
      const { data: existingEvents, error } = await supabase
        .from('match_events')
        .select('id, player_name, event_time, created_at')
        .eq('fixture_id', params.fixtureId)
        .eq('team_id', params.teamId)
        .eq('event_type', params.eventType)
        .eq('player_name', params.playerName)
        .eq('event_time', params.eventTime);

      if (error) {
        console.error('❌ EnhancedDuplicatePreventionService: Error checking duplicates:', error);
        return { isDuplicate: false, message: 'Error checking for duplicates' };
      }

      if (existingEvents && existingEvents.length > 0) {
        console.log('⚠️ EnhancedDuplicatePreventionService: Duplicate event found:', existingEvents);
        return {
          isDuplicate: true,
          existingEventId: existingEvents[0].id,
          duplicateCount: existingEvents.length,
          message: `${params.eventType} already assigned to ${params.playerName} at ${params.eventTime} seconds`
        };
      }

      console.log('✅ EnhancedDuplicatePreventionService: No duplicates found');
      return { isDuplicate: false };

    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Critical error:', error);
      return { isDuplicate: false, message: 'Critical error checking duplicates' };
    }
  },

  async cleanupAllDuplicateEvents(): Promise<{ removedCount: number; errors: string[]; summary: any }> {
    console.log('🧹 EnhancedDuplicatePreventionService: Starting comprehensive duplicate cleanup...');
    
    const result = { removedCount: 0, errors: [], summary: {} };

    try {
      // Get all match events grouped by potential duplicate keys
      const { data: events, error } = await supabase
        .from('match_events')
        .select('*')
        .order('fixture_id, event_type, team_id, player_name, event_time, created_at');

      if (error) {
        result.errors.push(`Error fetching events: ${error.message}`);
        return result;
      }

      if (!events || events.length === 0) {
        console.log('📊 EnhancedDuplicatePreventionService: No events found for cleanup');
        return result;
      }

      // Group events by potential duplicate criteria
      const eventGroups = new Map<string, any[]>();
      
      for (const event of events) {
        const key = `${event.fixture_id}-${event.event_type}-${event.team_id}-${event.player_name}-${event.event_time}`;
        if (!eventGroups.has(key)) {
          eventGroups.set(key, []);
        }
        eventGroups.get(key)!.push(event);
      }

      console.log(`📊 EnhancedDuplicatePreventionService: Found ${eventGroups.size} unique event groups`);

      // Process each group for duplicates
      for (const [key, groupEvents] of eventGroups) {
        if (groupEvents.length > 1) {
          console.log(`🗑️ EnhancedDuplicatePreventionService: Found ${groupEvents.length} duplicates for key: ${key}`);
          
          // Sort by created_at to keep the earliest entry
          groupEvents.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
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
                console.log(`✅ EnhancedDuplicatePreventionService: Removed duplicate event:`, eventToRemove);
              }
            } catch (error) {
              result.errors.push(`Error deleting event ${eventToRemove.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      }

      // Generate summary
      result.summary = {
        totalEventsProcessed: events.length,
        uniqueEventGroups: eventGroups.size,
        duplicateGroupsFound: Array.from(eventGroups.values()).filter(group => group.length > 1).length,
        duplicatesRemoved: result.removedCount
      };

      console.log('✅ EnhancedDuplicatePreventionService: Cleanup completed:', result);
      return result;

    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Critical error during cleanup:', error);
      result.errors.push(`Critical cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  },

  async validateEventIntegrity(fixtureId?: number): Promise<{ isValid: boolean; issues: string[]; recommendations: string[] }> {
    console.log('🔍 EnhancedDuplicatePreventionService: Validating event integrity');
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      let query = supabase.from('match_events').select('*');
      
      if (fixtureId) {
        query = query.eq('fixture_id', fixtureId);
      }

      const { data: events, error } = await query;

      if (error) {
        issues.push(`Error fetching events: ${error.message}`);
        return { isValid: false, issues, recommendations };
      }

      if (!events || events.length === 0) {
        return { isValid: true, issues: [], recommendations: ['No events found to validate'] };
      }

      // Check for various integrity issues
      const duplicateKeys = new Set<string>();
      const eventsByFixture = new Map<number, any[]>();

      events.forEach(event => {
        // Check for exact duplicates
        const duplicateKey = `${event.fixture_id}-${event.event_type}-${event.team_id}-${event.player_name}-${event.event_time}`;
        if (duplicateKeys.has(duplicateKey)) {
          issues.push(`Duplicate event found: ${event.event_type} for ${event.player_name} at time ${event.event_time}`);
        } else {
          duplicateKeys.add(duplicateKey);
        }

        // Group by fixture
        if (!eventsByFixture.has(event.fixture_id)) {
          eventsByFixture.set(event.fixture_id, []);
        }
        eventsByFixture.get(event.fixture_id)!.push(event);

        // Check for data quality issues
        if (!event.player_name || event.player_name.trim() === '') {
          issues.push(`Event ${event.id} has empty player name`);
        }

        if (event.event_time < 0) {
          issues.push(`Event ${event.id} has negative event time: ${event.event_time}`);
        }

        if (!['goal', 'assist', 'yellow_card', 'red_card'].includes(event.event_type)) {
          issues.push(`Event ${event.id} has invalid event type: ${event.event_type}`);
        }
      });

      // Generate recommendations
      if (issues.length > 0) {
        recommendations.push('Run duplicate cleanup to resolve duplicate events');
        recommendations.push('Validate player names and event times');
        recommendations.push('Consider implementing stricter validation before event creation');
      }

      const isValid = issues.length === 0;
      console.log(`🔍 EnhancedDuplicatePreventionService: Validation ${isValid ? 'passed' : 'failed'}:`, { issues, recommendations });

      return { isValid, issues, recommendations };

    } catch (error) {
      console.error('❌ EnhancedDuplicatePreventionService: Error during validation:', error);
      return {
        isValid: false,
        issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check database connectivity and try again']
      };
    }
  }
};
