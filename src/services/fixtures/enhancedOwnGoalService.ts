
import { supabase } from '@/integrations/supabase/client';

interface OwnGoalData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  playerTeamId: string;
  eventTime: number;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
}

interface OwnGoalResult {
  success: boolean;
  goalEventId?: number;
  scoringTeamId?: string;
  affectedTeamId?: string;
  message?: string;
  error?: string;
}

export const enhancedOwnGoalService = {
  async recordOwnGoal(data: OwnGoalData): Promise<OwnGoalResult> {
    console.log('⚽ EnhancedOwnGoalService: Recording own goal with proper team attribution:', data);
    
    try {
      // Validate input data
      if (!data.fixtureId || !data.playerId || !data.playerName?.trim()) {
        throw new Error('Missing required own goal data');
      }

      // Determine scoring team (opposite of player's team)
      const scoringTeamId = data.playerTeamId === data.homeTeam.id ? data.awayTeam.id : data.homeTeam.id;
      const affectedTeamId = data.playerTeamId;

      console.log('🎯 EnhancedOwnGoalService: Team attribution calculated:', {
        playerTeam: data.playerTeamId,
        scoringTeam: scoringTeamId,
        affectedTeam: affectedTeamId
      });

      // Create own goal event with enhanced schema
      const { data: goalEvent, error: eventError } = await supabase
        .from('match_events')
        .insert({
          fixture_id: data.fixtureId,
          event_type: 'goal',
          player_name: data.playerName,
          team_id: data.playerTeamId, // Player's actual team
          event_time: data.eventTime,
          is_own_goal: true,
          scoring_team_id: scoringTeamId, // Team that benefits from the own goal
          affected_team_id: affectedTeamId, // Team that is negatively affected
          description: `Own Goal by ${data.playerName} at ${Math.floor(data.eventTime / 60)}'${String(data.eventTime % 60).padStart(2, '0')}`
        })
        .select()
        .single();

      if (eventError) {
        console.error('❌ EnhancedOwnGoalService: Error creating own goal event:', eventError);
        throw new Error(`Failed to record own goal: ${eventError.message}`);
      }

      console.log('✅ EnhancedOwnGoalService: Own goal event created:', goalEvent);

      // Update fixture score based on scoring team
      await this.updateFixtureScoreForOwnGoal(data.fixtureId, data.homeTeam, data.awayTeam);

      return {
        success: true,
        goalEventId: goalEvent.id,
        scoringTeamId,
        affectedTeamId,
        message: `Own goal recorded for ${data.playerName}. Score attributed to ${scoringTeamId === data.homeTeam.id ? data.homeTeam.name : data.awayTeam.name}`
      };

    } catch (error) {
      console.error('❌ EnhancedOwnGoalService: Error recording own goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record own goal'
      };
    }
  },

  async updateFixtureScoreForOwnGoal(fixtureId: number, homeTeam: any, awayTeam: any): Promise<void> {
    console.log('📊 EnhancedOwnGoalService: Updating fixture score with own goal logic');
    
    try {
      // Count goals by scoring team (not player team for own goals)
      const { data: homeGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .eq('scoring_team_id', homeTeam.id);

      const { data: awayGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .eq('scoring_team_id', awayTeam.id);

      const homeScore = (homeGoals || []).length;
      const awayScore = (awayGoals || []).length;

      // Update fixture score
      const { error: updateError } = await supabase
        .from('fixtures')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', fixtureId);

      if (updateError) {
        console.error('❌ EnhancedOwnGoalService: Error updating fixture score:', updateError);
        throw updateError;
      }

      console.log('✅ EnhancedOwnGoalService: Fixture score updated with own goal logic:', { homeScore, awayScore });
    } catch (error) {
      console.error('❌ EnhancedOwnGoalService: Error in updateFixtureScoreForOwnGoal:', error);
      throw error;
    }
  },

  async getOwnGoalsSummary(fixtureId: number) {
    console.log('📊 EnhancedOwnGoalService: Getting own goals summary for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select(`
          *,
          player_team:teams!match_events_team_id_fkey(name),
          scoring_team:teams!match_events_scoring_team_id_fkey(name)
        `)
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .eq('is_own_goal', true)
        .order('event_time', { ascending: true });

      if (error) {
        console.error('❌ EnhancedOwnGoalService: Error fetching own goals summary:', error);
        return [];
      }

      console.log(`📊 EnhancedOwnGoalService: Found ${data?.length || 0} own goals`);
      return data || [];

    } catch (error) {
      console.error('❌ EnhancedOwnGoalService: Error in getOwnGoalsSummary:', error);
      return [];
    }
  }
};
