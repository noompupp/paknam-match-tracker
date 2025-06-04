
import { supabase } from '@/integrations/supabase/client';

export interface ResetSafetyCheck {
  canReset: boolean;
  warnings: string[];
  info: {
    eventsToDelete: number;
    cardsToDelete: number;
    playerTimesToDelete: number;
  };
}

export interface ResetResult {
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
    
    try {
      const warnings: string[] = [];
      
      // Count events that will be deleted
      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (eventsError) {
        warnings.push(`Could not check match events: ${eventsError.message}`);
      }

      // Count cards that will be deleted
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (cardsError) {
        warnings.push(`Could not check cards: ${cardsError.message}`);
      }

      // Count player time records that will be deleted
      const { data: playerTimes, error: playerTimesError } = await supabase
        .from('player_time_tracking')
        .select('id')
        .eq('fixture_id', fixtureId);

      if (playerTimesError) {
        warnings.push(`Could not check player time records: ${playerTimesError.message}`);
      }

      const info = {
        eventsToDelete: events?.length || 0,
        cardsToDelete: cards?.length || 0,
        playerTimesToDelete: playerTimes?.length || 0
      };

      const canReset = warnings.length === 0;

      console.log('📊 Reset safety check completed:', { canReset, info, warnings });

      return {
        canReset,
        warnings,
        info
      };

    } catch (error) {
      console.error('❌ Error in reset safety check:', error);
      return {
        canReset: false,
        warnings: [`Critical error during safety check: ${error instanceof Error ? error.message : 'Unknown error'}`],
        info: {
          eventsToDelete: 0,
          cardsToDelete: 0,
          playerTimesToDelete: 0
        }
      };
    }
  },

  async resetMatchData(fixtureId: number): Promise<ResetResult> {
    console.log('🔄 MatchResetService: Starting match data reset for fixture:', fixtureId);
    
    const errors: string[] = [];
    const deletedCounts = {
      events: 0,
      cards: 0,
      playerTimes: 0
    };

    try {
      // 1. Delete match events
      try {
        console.log('🗑️ Deleting match events...');
        const { data: deletedEvents, error: eventsError } = await supabase
          .from('match_events')
          .delete()
          .eq('fixture_id', fixtureId)
          .select('id');

        if (eventsError) {
          throw new Error(`Failed to delete match events: ${eventsError.message}`);
        }

        deletedCounts.events = deletedEvents?.length || 0;
        console.log(`✅ Deleted ${deletedCounts.events} match events`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error deleting events';
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      // 2. Delete cards
      try {
        console.log('🗑️ Deleting cards...');
        const { data: deletedCards, error: cardsError } = await supabase
          .from('cards')
          .delete()
          .eq('fixture_id', fixtureId)
          .select('id');

        if (cardsError) {
          throw new Error(`Failed to delete cards: ${cardsError.message}`);
        }

        deletedCounts.cards = deletedCards?.length || 0;
        console.log(`✅ Deleted ${deletedCounts.cards} cards`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error deleting cards';
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      // 3. Delete player time tracking records
      try {
        console.log('🗑️ Deleting player time records...');
        const { data: deletedPlayerTimes, error: playerTimesError } = await supabase
          .from('player_time_tracking')
          .delete()
          .eq('fixture_id', fixtureId)
          .select('id');

        if (playerTimesError) {
          throw new Error(`Failed to delete player time records: ${playerTimesError.message}`);
        }

        deletedCounts.playerTimes = deletedPlayerTimes?.length || 0;
        console.log(`✅ Deleted ${deletedCounts.playerTimes} player time records`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error deleting player times';
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      // 4. Reset fixture scores to 0-0
      try {
        console.log('🔄 Resetting fixture scores...');
        const { error: fixtureError } = await supabase
          .from('fixtures')
          .update({ 
            home_score: 0, 
            away_score: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', fixtureId);

        if (fixtureError) {
          throw new Error(`Failed to reset fixture scores: ${fixtureError.message}`);
        }

        console.log('✅ Fixture scores reset to 0-0');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error resetting scores';
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      const success = errors.length === 0;
      const totalDeleted = deletedCounts.events + deletedCounts.cards + deletedCounts.playerTimes;
      
      const message = success 
        ? `Match data reset successfully: ${totalDeleted} records deleted, scores reset to 0-0`
        : `Match data partially reset with ${errors.length} errors`;

      console.log(success ? '✅' : '⚠️', 'MatchResetService completed:', {
        success,
        deletedCounts,
        errorsCount: errors.length
      });

      return {
        success,
        message,
        errors,
        deletedCounts
      };

    } catch (error) {
      console.error('❌ MatchResetService: Critical error during reset:', error);
      
      return {
        success: false,
        message: 'Critical error during match data reset',
        errors: [error instanceof Error ? error.message : 'Unknown critical error'],
        deletedCounts
      };
    }
  }
};
