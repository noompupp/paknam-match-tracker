
import { supabase } from '@/integrations/supabase/client';

export interface MatchResetResult {
  success: boolean;
  message: string;
  errors: string[];
  itemsDeleted: {
    matchEvents: number;
    playerTimeTracking: number;
  };
}

export const matchResetService = {
  async resetMatchData(fixtureId: number): Promise<MatchResetResult> {
    console.log('🔄 MatchResetService: Starting match data reset for fixture:', fixtureId);
    
    const result: MatchResetResult = {
      success: false,
      message: '',
      errors: [],
      itemsDeleted: {
        matchEvents: 0,
        playerTimeTracking: 0
      }
    };

    if (!fixtureId || fixtureId <= 0) {
      result.errors.push('Invalid fixture ID provided');
      result.message = 'Cannot reset match data: Invalid fixture ID';
      return result;
    }

    try {
      // 1. Delete match events (goals, cards, etc.)
      console.log('🗑️ Deleting match events...');
      const { data: deletedEvents, error: eventsError } = await supabase
        .from('match_events')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (eventsError) {
        result.errors.push(`Failed to delete match events: ${eventsError.message}`);
      } else {
        result.itemsDeleted.matchEvents = deletedEvents?.length || 0;
        console.log(`✅ Deleted ${result.itemsDeleted.matchEvents} match events`);
      }

      // 2. Delete player time tracking data
      console.log('⏱️ Deleting player time tracking data...');
      const { data: deletedTimeTracking, error: timeError } = await supabase
        .from('player_time_tracking')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (timeError) {
        result.errors.push(`Failed to delete player time tracking: ${timeError.message}`);
      } else {
        result.itemsDeleted.playerTimeTracking = deletedTimeTracking?.length || 0;
        console.log(`✅ Deleted ${result.itemsDeleted.playerTimeTracking} player time tracking records`);
      }

      // 3. Reset fixture scores
      console.log('📊 Resetting fixture scores...');
      const { error: fixtureError } = await supabase
        .from('fixtures')
        .update({
          home_score: null,
          away_score: null,
          status: 'scheduled'
        })
        .eq('id', fixtureId);

      if (fixtureError) {
        result.errors.push(`Failed to reset fixture scores: ${fixtureError.message}`);
      } else {
        console.log('✅ Fixture scores reset successfully');
      }

      // 4. Reset member stats (goals, assists, cards) - we'll need to recalculate these
      console.log('📈 Resetting member stats will require recalculation from remaining events...');
      
      result.success = result.errors.length === 0;
      
      if (result.success) {
        result.message = `Match data reset successfully. Deleted ${result.itemsDeleted.matchEvents} events and ${result.itemsDeleted.playerTimeTracking} time tracking records.`;
      } else {
        result.message = `Match data reset completed with ${result.errors.length} errors.`;
      }

      console.log(result.success ? '✅' : '⚠️', 'MatchResetService completed:', {
        success: result.success,
        eventsDeleted: result.itemsDeleted.matchEvents,
        timeTrackingDeleted: result.itemsDeleted.playerTimeTracking,
        errorsCount: result.errors.length
      });

      return result;

    } catch (error) {
      console.error('❌ MatchResetService: Critical error during reset:', error);
      
      result.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.message = 'Match data reset failed due to critical error';
      
      return result;
    }
  },

  async validateResetOperation(fixtureId: number): Promise<{ canReset: boolean; warnings: string[] }> {
    console.log('🔍 MatchResetService: Validating reset operation for fixture:', fixtureId);
    
    const warnings: string[] = [];
    
    try {
      // Check if fixture exists
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('id, status')
        .eq('id', fixtureId)
        .single();

      if (fixtureError || !fixture) {
        warnings.push('Fixture not found or inaccessible');
        return { canReset: false, warnings };
      }

      // Check for existing data that will be deleted
      const { data: events } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId);

      const { data: timeTracking } = await supabase
        .from('player_time_tracking')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (events && events.length > 0) {
        warnings.push(`This will delete ${events.length} match events (goals, cards, etc.)`);
      }

      if (timeTracking && timeTracking.length > 0) {
        warnings.push(`This will delete ${timeTracking.length} player time tracking records`);
      }

      return { canReset: true, warnings };

    } catch (error) {
      console.error('❌ MatchResetService: Error validating reset operation:', error);
      warnings.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { canReset: false, warnings };
    }
  }
};
