
import { supabase } from '@/integrations/supabase/client';

interface ResetSafetyCheck {
  canReset: boolean;
  warnings: string[];
  info: {
    eventsToDelete: number;
    cardsToDelete: number;
    playerTimesToDelete: number;
  };
}

interface ResetResult {
  success: boolean;
  message: string;
  errors: string[];
  deletedCounts: {
    events: number;
    cards: number;
    playerTimes: number;
  };
}

export const matchResetService = {
  async confirmResetSafety(fixtureId: number): Promise<ResetSafetyCheck> {
    console.log('🔍 MatchResetService: Checking reset safety for fixture:', fixtureId);
    
    const result: ResetSafetyCheck = {
      canReset: true,
      warnings: [],
      info: {
        eventsToDelete: 0,
        cardsToDelete: 0,
        playerTimesToDelete: 0
      }
    };

    try {
      // Count match events
      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (eventsError) {
        result.warnings.push(`Could not check match events: ${eventsError.message}`);
      } else {
        result.info.eventsToDelete = events?.length || 0;
      }

      // Count cards
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (cardsError) {
        result.warnings.push(`Could not check cards: ${cardsError.message}`);
      } else {
        result.info.cardsToDelete = cards?.length || 0;
      }

      // Count player time tracking
      const { data: playerTimes, error: playerTimesError } = await supabase
        .from('player_time_tracking')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (playerTimesError) {
        result.warnings.push(`Could not check player times: ${playerTimesError.message}`);
      } else {
        result.info.playerTimesToDelete = playerTimes?.length || 0;
      }

      console.log('📊 MatchResetService: Reset safety check completed:', result);

    } catch (error) {
      console.error('❌ MatchResetService: Error in safety check:', error);
      result.canReset = false;
      result.warnings.push(`Safety check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  },

  async resetMatchData(fixtureId: number): Promise<ResetResult> {
    console.log('🔄 MatchResetService: Starting match data reset for fixture:', fixtureId);
    
    const result: ResetResult = {
      success: false,
      message: '',
      errors: [],
      deletedCounts: {
        events: 0,
        cards: 0,
        playerTimes: 0
      }
    };

    try {
      // Reset fixture scores
      const { error: fixtureError } = await supabase
        .from('fixtures')
        .update({
          home_score: 0,
          away_score: 0
        })
        .eq('id', fixtureId);

      if (fixtureError) {
        result.errors.push(`Failed to reset fixture scores: ${fixtureError.message}`);
      }

      // Delete match events
      const { data: deletedEvents, error: eventsError } = await supabase
        .from('match_events')
        .delete()
        .eq('fixture_id', fixtureId)
        .select('id');

      if (eventsError) {
        result.errors.push(`Failed to delete match events: ${eventsError.message}`);
      } else {
        result.deletedCounts.events = deletedEvents?.length || 0;
      }

      // Delete cards
      const { data: deletedCards, error: cardsError } = await supabase
        .from('cards')
        .delete()
        .eq('fixture_id', fixtureId)
        .select('id');

      if (cardsError) {
        result.errors.push(`Failed to delete cards: ${cardsError.message}`);
      } else {
        result.deletedCounts.cards = deletedCards?.length || 0;
      }

      // Delete player time tracking
      const { data: deletedPlayerTimes, error: playerTimesError } = await supabase
        .from('player_time_tracking')
        .delete()
        .eq('fixture_id', fixtureId)
        .select('id');

      if (playerTimesError) {
        result.errors.push(`Failed to delete player times: ${playerTimesError.message}`);
      } else {
        result.deletedCounts.playerTimes = deletedPlayerTimes?.length || 0;
      }

      // Determine success
      result.success = result.errors.length === 0;
      
      if (result.success) {
        result.message = `Match data reset successfully: ${result.deletedCounts.events} events, ${result.deletedCounts.cards} cards, ${result.deletedCounts.playerTimes} player times deleted`;
      } else {
        result.message = `Match data partially reset with ${result.errors.length} errors`;
      }

      console.log('✅ MatchResetService: Reset completed:', result);

    } catch (error) {
      console.error('❌ MatchResetService: Critical error during reset:', error);
      result.errors.push(`Critical reset error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.message = 'Match data reset failed due to critical errors';
    }

    return result;
  }
};
