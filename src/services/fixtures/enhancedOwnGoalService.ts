
import { supabase } from '@/integrations/supabase/client';

interface OwnGoalData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  playerTeamId: string;
  playerTeamName: string;
  eventTime: number;
  homeTeam: { id: string; name: string; __id__?: string };
  awayTeam: { id: string; name: string; __id__?: string };
}

interface OwnGoalResult {
  success: boolean;
  goalEventId?: number;
  scoreUpdated?: boolean;
  homeScore?: number;
  awayScore?: number;
  message?: string;
  error?: string;
}

export const enhancedOwnGoalService = {
  async addOwnGoal(data: OwnGoalData): Promise<OwnGoalResult> {
    console.log('🥅 Enhanced Own Goal Service: Processing own goal with enhanced validation:', data);
    
    try {
      // Validate input data
      if (!data.fixtureId || !data.playerName || data.eventTime < 0) {
        throw new Error('Invalid own goal data provided');
      }

      // Determine which team benefits from the own goal (opposing team)
      const playerTeamId = data.playerTeamId;
      const homeTeamId = data.homeTeam.__id__ || data.homeTeam.id;
      const awayTeamId = data.awayTeam.__id__ || data.awayTeam.id;
      
      let beneficiaryTeamId: string;
      let beneficiaryTeamName: string;
      
      if (playerTeamId === homeTeamId) {
        // Player is from home team, so away team benefits
        beneficiaryTeamId = awayTeamId;
        beneficiaryTeamName = data.awayTeam.name;
      } else if (playerTeamId === awayTeamId) {
        // Player is from away team, so home team benefits
        beneficiaryTeamId = homeTeamId;
        beneficiaryTeamName = data.homeTeam.name;
      } else {
        throw new Error('Cannot determine beneficiary team for own goal');
      }

      console.log('🎯 Enhanced Own Goal Service: Own goal beneficiary determined:', {
        playerTeam: data.playerTeamName,
        playerTeamId,
        beneficiaryTeam: beneficiaryTeamName,
        beneficiaryTeamId
      });

      // Create match event with proper own goal handling
      const { data: matchEvent, error } = await supabase
        .from('match_events')
        .insert({
          fixture_id: data.fixtureId,
          event_type: 'goal',
          player_name: data.playerName,
          team_id: playerTeamId, // Player's actual team
          scoring_team_id: beneficiaryTeamId, // Team that benefits from the own goal
          affected_team_id: playerTeamId, // Player's team (affected negatively)
          event_time: data.eventTime,
          is_own_goal: true, // Mark as own goal
          description: `Own goal by ${data.playerName} (${data.playerTeamName}) - benefits ${beneficiaryTeamName}`
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Enhanced Own Goal Service: Database error:', error);
        throw error;
      }

      console.log('✅ Enhanced Own Goal Service: Own goal event created successfully:', matchEvent);

      // Update fixture score (own goals count towards opposing team)
      const scoreUpdateResult = await this.updateFixtureScoreForOwnGoal(
        data.fixtureId,
        data.homeTeam,
        data.awayTeam
      );

      return {
        success: true,
        goalEventId: matchEvent.id,
        scoreUpdated: scoreUpdateResult.success,
        homeScore: scoreUpdateResult.homeScore,
        awayScore: scoreUpdateResult.awayScore,
        message: `Own goal recorded for ${data.playerName} - ${beneficiaryTeamName} benefits`
      };

    } catch (error) {
      console.error('❌ Enhanced Own Goal Service: Own goal processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process own goal',
        message: 'Own goal processing failed'
      };
    }
  },

  async updateFixtureScoreForOwnGoal(
    fixtureId: number,
    homeTeam: any,
    awayTeam: any
  ): Promise<{ success: boolean; homeScore: number; awayScore: number }> {
    console.log('📊 Enhanced Own Goal Service: Updating fixture score for own goal');
    
    try {
      const homeTeamId = homeTeam.__id__ || homeTeam.id;
      const awayTeamId = awayTeam.__id__ || awayTeam.id;

      // Count all goals with proper own goal handling
      const { data: allGoals } = await supabase
        .from('match_events')
        .select('id, team_id, scoring_team_id, is_own_goal')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal');

      let homeScore = 0;
      let awayScore = 0;

      (allGoals || []).forEach(goal => {
        // Use scoring_team_id if available (handles own goals), otherwise fall back to team_id
        const scoringTeam = goal.scoring_team_id || goal.team_id;
        
        if (scoringTeam === homeTeamId) {
          homeScore++;
        } else if (scoringTeam === awayTeamId) {
          awayScore++;
        }
      });

      console.log('📊 Enhanced Own Goal Service: Calculated scores with own goal logic:', { 
        homeScore, 
        awayScore,
        totalGoals: (allGoals || []).length
      });

      // Update fixture
      const { error: updateError } = await supabase
        .from('fixtures')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', fixtureId);

      if (updateError) {
        console.error('❌ Enhanced Own Goal Service: Error updating fixture score:', updateError);
        return { success: false, homeScore: 0, awayScore: 0 };
      }

      console.log('✅ Enhanced Own Goal Service: Fixture score updated:', { homeScore, awayScore });
      return { success: true, homeScore, awayScore };

    } catch (error) {
      console.error('❌ Enhanced Own Goal Service: Error in updateFixtureScoreForOwnGoal:', error);
      return { success: false, homeScore: 0, awayScore: 0 };
    }
  }
};
