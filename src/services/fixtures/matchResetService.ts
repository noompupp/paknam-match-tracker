
import { supabase } from '@/integrations/supabase/client';

interface MatchResetResult {
  success: boolean;
  message: string;
  details: {
    eventsRemoved: number;
    cardsRemoved: number;
    playerTimesRemoved: number;
    scoreReset: boolean;
  };
  errors: string[];
}

export const matchResetService = {
  async resetMatchData(fixtureId: number): Promise<MatchResetResult> {
    console.log('🔄 MatchResetService: Starting complete match reset for fixture:', fixtureId);
    
    const result: MatchResetResult = {
      success: false,
      message: '',
      details: {
        eventsRemoved: 0,
        cardsRemoved: 0,
        playerTimesRemoved: 0,
        scoreReset: false
      },
      errors: []
    };

    try {
      // Validate fixture exists
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('id, home_team_id, away_team_id')
        .eq('id', fixtureId)
        .single();

      if (fixtureError || !fixture) {
        throw new Error(`Fixture ${fixtureId} not found`);
      }

      console.log('✅ MatchResetService: Fixture found, proceeding with reset');

      // 1. Remove all match events
      const { data: deletedEvents, error: eventsError } = await supabase
        .from('match_events')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (eventsError) {
        result.errors.push(`Failed to delete match events: ${eventsError.message}`);
      } else {
        result.details.eventsRemoved = deletedEvents?.length || 0;
        console.log(`✅ MatchResetService: Removed ${result.details.eventsRemoved} match events`);
      }

      // 2. Remove all cards
      const { data: deletedCards, error: cardsError } = await supabase
        .from('cards')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (cardsError) {
        result.errors.push(`Failed to delete cards: ${cardsError.message}`);
      } else {
        result.details.cardsRemoved = deletedCards?.length || 0;
        console.log(`✅ MatchResetService: Removed ${result.details.cardsRemoved} cards`);
      }

      // 3. Remove all player time tracking
      const { data: deletedPlayerTimes, error: playerTimesError } = await supabase
        .from('player_time_tracking')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (playerTimesError) {
        result.errors.push(`Failed to delete player times: ${playerTimesError.message}`);
      } else {
        result.details.playerTimesRemoved = deletedPlayerTimes?.length || 0;
        console.log(`✅ MatchResetService: Removed ${result.details.playerTimesRemoved} player time records`);
      }

      // 4. Reset fixture score
      const { error: scoreResetError } = await supabase
        .from('fixtures')
        .update({
          home_score: 0,
          away_score: 0,
          status: 'scheduled'
        })
        .eq('id', fixtureId);

      if (scoreResetError) {
        result.errors.push(`Failed to reset fixture score: ${scoreResetError.message}`);
      } else {
        result.details.scoreReset = true;
        console.log('✅ MatchResetService: Fixture score reset to 0-0');
      }

      // 5. Reset player stats that were affected by this match
      await this.resetPlayerStatsFromMatch(fixtureId);

      // Determine overall success
      result.success = result.errors.length === 0;
      
      if (result.success) {
        result.message = `Match data successfully reset. Removed ${result.details.eventsRemoved} events, ${result.details.cardsRemoved} cards, ${result.details.playerTimesRemoved} player time records, and reset score to 0-0.`;
      } else {
        result.message = `Match reset completed with ${result.errors.length} errors. Some data may not have been reset properly.`;
      }

      console.log('✅ MatchResetService: Match reset completed:', result);
      return result;

    } catch (error) {
      console.error('❌ MatchResetService: Critical error during match reset:', error);
      result.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.message = 'Match reset failed due to critical error';
      return result;
    }
  },

  async resetPlayerStatsFromMatch(fixtureId: number): Promise<void> {
    console.log('📊 MatchResetService: Resetting player stats affected by match:', fixtureId);
    
    try {
      // This is a simplified approach - in a real system you'd want to:
      // 1. Track which stats were added by this specific match
      // 2. Subtract only those stats
      // For now, we'll log that this needs manual attention
      
      console.log('⚠️ MatchResetService: Player stats reset requires manual attention - consider running stats sync after reset');
      
      // Future enhancement: Track match-specific stat changes
      // and reverse them here
      
    } catch (error) {
      console.error('❌ MatchResetService: Error resetting player stats:', error);
    }
  },

  async confirmResetSafety(fixtureId: number): Promise<{ canReset: boolean; warnings: string[]; info: any }> {
    console.log('🔍 MatchResetService: Checking reset safety for fixture:', fixtureId);
    
    const warnings: string[] = [];
    const info: any = {};

    try {
      // Check what data will be lost
      const { data: events } = await supabase
        .from('match_events')
        .select('event_type')
        .eq('fixture_id', fixtureId);

      const { data: cards } = await supabase
        .from('cards')
        .select('id')
        .eq('fixture_id', fixtureId);

      const { data: playerTimes } = await supabase
        .from('player_time_tracking')
        .select('id')
        .eq('fixture_id', fixtureId);

      info.eventsToDelete = events?.length || 0;
      info.cardsToDelete = cards?.length || 0;
      info.playerTimesToDelete = playerTimes?.length || 0;

      // Generate warnings
      if (info.eventsToDelete > 0) {
        warnings.push(`${info.eventsToDelete} match events will be permanently deleted`);
      }
      if (info.cardsToDelete > 0) {
        warnings.push(`${info.cardsToDelete} cards will be permanently deleted`);
      }
      if (info.playerTimesToDelete > 0) {
        warnings.push(`${info.playerTimesToDelete} player time records will be permanently deleted`);
      }

      warnings.push('Player statistics may need to be recalculated after reset');
      warnings.push('This action cannot be undone');

      return {
        canReset: true,
        warnings,
        info
      };

    } catch (error) {
      console.error('❌ MatchResetService: Error checking reset safety:', error);
      return {
        canReset: false,
        warnings: ['Error checking reset safety - reset not recommended'],
        info: {}
      };
    }
  }
};
