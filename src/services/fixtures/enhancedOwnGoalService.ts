
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
    console.log('🥅 Enhanced Own Goal Service: Processing own goal with standardized schema:', data);
    
    try {
      // Determine which team benefits from the own goal
      const playerTeamId = data.playerTeamId;
      const homeTeamId = data.homeTeam.__id__ || data.homeTeam.id;
      const awayTeamId = data.awayTeam.__id__ || data.awayTeam.id;
      
      const scoringTeamId = playerTeamId === homeTeamId ? awayTeamId : homeTeamId;
      const scoringTeamName = playerTeamId === homeTeamId ? data.awayTeam.name : data.homeTeam.name;
      
      console.log('🎯 Enhanced Own Goal Service: Own goal logic:', {
        playerTeam: data.playerTeamName,
        playerTeamId,
        scoringTeam: scoringTeamName,
        scoringTeamId,
        homeTeamId,
        awayTeamId
      });

      // Create the own goal event with standardized schema
      const eventData = {
        fixture_id: data.fixtureId,
        event_type: 'goal' as const,
        player_name: data.playerName,
        team_id: playerTeamId, // Player's actual team
        event_time: data.eventTime,
        is_own_goal: true, // Use standardized column
        description: `Own goal by ${data.playerName} (${data.playerTeamName}) - benefits ${scoringTeamName}`
      };

      console.log('🚀 Enhanced Own Goal Service: Inserting own goal event:', eventData);

      const { data: matchEvent, error } = await supabase
        .from('match_events')
        .insert(eventData)
        .select()
        .single();

      if (error) {
        console.error('❌ Enhanced Own Goal Service: Database error:', error);
        throw new Error(`Failed to create own goal event: ${error.message}`);
      }

      console.log('✅ Enhanced Own Goal Service: Own goal event created:', matchEvent);

      // Update fixture score - own goals benefit the opposing team
      const scoreUpdateResult = await this.updateFixtureScoreForOwnGoal(
        data.fixtureId,
        data.homeTeam,
        data.awayTeam
      );

      // Note: We deliberately do NOT update player stats for own goals
      console.log('📊 Enhanced Own Goal Service: Skipping player stats update for own goal (correct behavior)');

      return {
        success: true,
        goalEventId: matchEvent.id,
        scoreUpdated: scoreUpdateResult.success,
        homeScore: scoreUpdateResult.homeScore,
        awayScore: scoreUpdateResult.awayScore,
        message: `Own goal recorded for ${data.playerName} - benefits ${scoringTeamName}`
      };

    } catch (error) {
      console.error('❌ Enhanced Own Goal Service: Error processing own goal:', error);
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

      // Count goals using the standardized schema with proper own goal handling
      const { data: allGoals, error: goalsError } = await supabase
        .from('match_events')
        .select('id, team_id, is_own_goal, scoring_team_id')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal');

      if (goalsError) {
        console.error('❌ Error fetching goals for score calculation:', goalsError);
        throw goalsError;
      }

      let homeScore = 0;
      let awayScore = 0;

      (allGoals || []).forEach(goal => {
        // Use scoring_team_id if available (for own goals), otherwise use team_id
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

      console.log('✅ Enhanced Own Goal Service: Fixture score updated successfully:', { homeScore, awayScore });
      return { success: true, homeScore, awayScore };

    } catch (error) {
      console.error('❌ Enhanced Own Goal Service: Error in updateFixtureScoreForOwnGoal:', error);
      return { success: false, homeScore: 0, awayScore: 0 };
    }
  }
};
