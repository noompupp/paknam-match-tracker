
import { supabase } from '@/integrations/supabase/client';

export interface MatchParticipationResult {
  success: boolean;
  message: string;
  playersUpdated?: number;
  error?: string;
}

export const matchParticipationService = {
  /**
   * Update matches played count for players who participated in a specific match
   */
  async updateMatchParticipation(fixtureId: number): Promise<MatchParticipationResult> {
    console.log('📊 MatchParticipationService: Updating match participation for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase.rpc('update_match_participation', {
        p_fixture_id: fixtureId
      });

      if (error) {
        console.error('❌ MatchParticipationService: Error updating match participation:', error);
        return {
          success: false,
          message: 'Failed to update match participation',
          error: error.message
        };
      }

      const result = data as { success: boolean; players_updated: number; error?: string };
      
      if (!result.success) {
        console.error('❌ MatchParticipationService: Function returned error:', result.error);
        return {
          success: false,
          message: 'Database function reported error',
          error: result.error
        };
      }

      console.log('✅ MatchParticipationService: Successfully updated match participation:', {
        fixtureId,
        playersUpdated: result.players_updated
      });

      return {
        success: true,
        message: `Updated matches played for ${result.players_updated} players`,
        playersUpdated: result.players_updated
      };

    } catch (error) {
      console.error('❌ MatchParticipationService: Critical error:', error);
      return {
        success: false,
        message: 'Critical error updating match participation',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Sync all existing match participation data (one-time migration)
   */
  async syncAllMatchParticipation(): Promise<MatchParticipationResult> {
    console.log('🔄 MatchParticipationService: Starting full match participation sync...');
    
    try {
      const { data, error } = await supabase.rpc('sync_all_match_participation');

      if (error) {
        console.error('❌ MatchParticipationService: Error syncing all match participation:', error);
        return {
          success: false,
          message: 'Failed to sync match participation data',
          error: error.message
        };
      }

      const result = data as { success: boolean; total_players_updated: number; error?: string };
      
      if (!result.success) {
        console.error('❌ MatchParticipationService: Sync function returned error:', result.error);
        return {
          success: false,
          message: 'Database sync function reported error',
          error: result.error
        };
      }

      console.log('✅ MatchParticipationService: Successfully synced all match participation:', {
        totalPlayersUpdated: result.total_players_updated
      });

      return {
        success: true,
        message: `Synced matches played for ${result.total_players_updated} player entries`,
        playersUpdated: result.total_players_updated
      };

    } catch (error) {
      console.error('❌ MatchParticipationService: Critical sync error:', error);
      return {
        success: false,
        message: 'Critical error syncing match participation data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
