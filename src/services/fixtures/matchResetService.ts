
import { supabase } from '@/integrations/supabase/client';

interface ResetValidationResult {
  canReset: boolean;
  warnings: string[];
  matchEvents: number;
  playerTimeRecords: number;
}

interface ResetResult {
  success: boolean;
  message: string;
  errors: string[];
  eventsDeleted: number;
  playerTimeRecordsDeleted: number;
}

export const matchResetService = {
  async validateResetOperation(fixtureId: number): Promise<ResetValidationResult> {
    console.log('🔍 matchResetService: Validating reset operation for fixture:', fixtureId);
    
    try {
      // Count existing match events
      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (eventsError) {
        console.error('❌ matchResetService: Error counting events:', eventsError);
        throw eventsError;
      }

      // Count existing player time records
      const { data: playerTimes, error: playerTimesError } = await supabase
        .from('player_time_tracking')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (playerTimesError) {
        console.error('❌ matchResetService: Error counting player times:', playerTimesError);
        throw playerTimesError;
      }

      const matchEvents = events?.length || 0;
      const playerTimeRecords = playerTimes?.length || 0;
      const warnings: string[] = [];

      if (matchEvents > 0) {
        warnings.push(`${matchEvents} match event(s) will be deleted`);
      }
      
      if (playerTimeRecords > 0) {
        warnings.push(`${playerTimeRecords} player time record(s) will be deleted`);
      }

      return {
        canReset: true, // We allow reset in most cases, but show warnings
        warnings,
        matchEvents,
        playerTimeRecords
      };

    } catch (error) {
      console.error('❌ matchResetService: Error validating reset:', error);
      return {
        canReset: false,
        warnings: ['Validation failed - cannot safely reset'],
        matchEvents: 0,
        playerTimeRecords: 0
      };
    }
  },

  async resetMatchData(fixtureId: number): Promise<ResetResult> {
    console.log('🔄 matchResetService: Starting complete match data reset for fixture:', fixtureId);
    
    const errors: string[] = [];
    let eventsDeleted = 0;
    let playerTimeRecordsDeleted = 0;

    try {
      // 1. Delete all match events
      console.log('🗑️ matchResetService: Deleting match events...');
      const { data: deletedEvents, error: eventsError } = await supabase
        .from('match_events')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (eventsError) {
        console.error('❌ matchResetService: Error deleting events:', eventsError);
        errors.push(`Failed to delete match events: ${eventsError.message}`);
      } else {
        eventsDeleted = deletedEvents?.length || 0;
        console.log(`✅ matchResetService: Deleted ${eventsDeleted} match events`);
      }

      // 2. Delete all player time tracking records
      console.log('🗑️ matchResetService: Deleting player time records...');
      const { data: deletedPlayerTimes, error: playerTimesError } = await supabase
        .from('player_time_tracking')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (playerTimesError) {
        console.error('❌ matchResetService: Error deleting player times:', playerTimesError);
        errors.push(`Failed to delete player time records: ${playerTimesError.message}`);
      } else {
        playerTimeRecordsDeleted = deletedPlayerTimes?.length || 0;
        console.log(`✅ matchResetService: Deleted ${playerTimeRecordsDeleted} player time records`);
      }

      // 3. Reset fixture scores to 0-0
      console.log('🔄 matchResetService: Resetting fixture scores...');
      const { error: fixtureError } = await supabase
        .from('fixtures')
        .update({
          home_score: 0,
          away_score: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', fixtureId);

      if (fixtureError) {
        console.error('❌ matchResetService: Error resetting fixture:', fixtureError);
        errors.push(`Failed to reset fixture scores: ${fixtureError.message}`);
      } else {
        console.log('✅ matchResetService: Fixture scores reset to 0-0');
      }

      // Determine success
      const isFullSuccess = errors.length === 0;
      const message = isFullSuccess 
        ? `Match data completely reset: ${eventsDeleted} events and ${playerTimeRecordsDeleted} player time records deleted, scores reset to 0-0`
        : `Match data partially reset with ${errors.length} error(s)`;

      console.log(`${isFullSuccess ? '✅' : '⚠️'} matchResetService: Reset completed with result:`, {
        success: isFullSuccess,
        eventsDeleted,
        playerTimeRecordsDeleted,
        errors
      });

      return {
        success: isFullSuccess,
        message,
        errors,
        eventsDeleted,
        playerTimeRecordsDeleted
      };

    } catch (error) {
      console.error('❌ matchResetService: Critical error during reset:', error);
      return {
        success: false,
        message: 'Critical error during reset operation',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        eventsDeleted,
        playerTimeRecordsDeleted
      };
    }
  }
};
