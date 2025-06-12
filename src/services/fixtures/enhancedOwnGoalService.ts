
import { supabase } from '@/integrations/supabase/client';
import { getValidatedTeamId } from '@/utils/teamIdMapping';

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
    console.log('🥅 Enhanced Own Goal Service: Adding own goal with standardized is_own_goal column:', data);
    
    try {
      // Validate input data
      if (!data.fixtureId || !data.playerId || !data.playerName || data.eventTime < 0) {
        throw new Error('Invalid own goal data provided');
      }

      // Validate team exists in database
      const teamId = await getValidatedTeamId(data.playerTeamName, data.homeTeam, data.awayTeam);
      
      const { data: teamExists, error: teamCheckError } = await supabase
        .from('teams')
        .select('__id__, name')
        .eq('__id__', teamId)
        .single();

      if (teamCheckError || !teamExists) {
        console.error('❌ Enhanced Own Goal Service: Team verification failed:', {
          teamId,
          error: teamCheckError
        });
        throw new Error(`Team with ID "${teamId}" not found in database`);
      }

      console.log('✅ Enhanced Own Goal Service: Team verified:', teamExists);

      // Create own goal event with standardized is_own_goal flag
      const { data: goalEvent, error: eventError } = await supabase
        .from('match_events')
        .insert({
          fixture_id: data.fixtureId,
          event_type: 'goal',
          player_name: data.playerName,
          team_id: teamId,
          event_time: data.eventTime,
          is_own_goal: true, // Standardized own goal flag
          description: `Own goal by ${data.playerName} at ${Math.floor(data.eventTime / 60)}'${String(data.eventTime % 60).padStart(2, '0')}`
        })
        .select()
        .single();

      if (eventError) {
        console.error('❌ Enhanced Own Goal Service: Error creating own goal event:', eventError);
        throw new Error(`Failed to create own goal event: ${eventError.message}`);
      }

      console.log('✅ Enhanced Own Goal Service: Own goal event created:', goalEvent);

      // Update fixture score (own goal benefits the opposing team)
      const scoreUpdateResult = await this.updateFixtureScoreForOwnGoal(
        data.fixtureId, 
        data.homeTeam, 
        data.awayTeam,
        data.playerTeamId
      );

      return {
        success: true,
        goalEventId: goalEvent.id,
        scoreUpdated: scoreUpdateResult.success,
        homeScore: scoreUpdateResult.homeScore,
        awayScore: scoreUpdateResult.awayScore,
        message: `Own goal recorded for ${data.playerName}${scoreUpdateResult.success ? ' and score updated' : ''}`
      };

    } catch (error) {
      console.error('❌ Enhanced Own Goal Service: Error adding own goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add own goal',
        message: 'Failed to record own goal'
      };
    }
  },

  async updateFixtureScoreForOwnGoal(
    fixtureId: number, 
    homeTeam: any, 
    awayTeam: any, 
    playerTeamId: string
  ): Promise<{ success: boolean; homeScore: number; awayScore: number }> {
    console.log('📊 Enhanced Own Goal Service: Updating fixture score for own goal');
    
    try {
      const homeTeamId = homeTeam.__id__ || homeTeam.id;
      const awayTeamId = awayTeam.__id__ || awayTeam.id;

      // Count regular goals for each team (excluding own goals)
      const { data: homeRegularGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('team_id', homeTeamId)
        .eq('event_type', 'goal')
        .eq('is_own_goal', false);

      const { data: awayRegularGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('team_id', awayTeamId)
        .eq('event_type', 'goal')
        .eq('is_own_goal', false);

      // Count own goals that benefit each team
      const { data: homeOwnGoalBenefits } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('team_id', awayTeamId) // Away team's own goals benefit home team
        .eq('event_type', 'goal')
        .eq('is_own_goal', true);

      const { data: awayOwnGoalBenefits } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('team_id', homeTeamId) // Home team's own goals benefit away team
        .eq('event_type', 'goal')
        .eq('is_own_goal', true);

      const homeScore = (homeRegularGoals || []).length + (homeOwnGoalBenefits || []).length;
      const awayScore = (awayRegularGoals || []).length + (awayOwnGoalBenefits || []).length;

      console.log('📊 Enhanced Own Goal Service: Calculated scores with own goals:', { 
        homeScore, 
        awayScore,
        homeRegular: (homeRegularGoals || []).length,
        awayRegular: (awayRegularGoals || []).length,
        homeFromOwnGoals: (homeOwnGoalBenefits || []).length,
        awayFromOwnGoals: (awayOwnGoalBenefits || []).length
      });

      // Update fixture with correct scores
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

      console.log('✅ Enhanced Own Goal Service: Fixture score updated for own goal:', { homeScore, awayScore });
      return { success: true, homeScore, awayScore };

    } catch (error) {
      console.error('❌ Enhanced Own Goal Service: Error in updateFixtureScoreForOwnGoal:', error);
      return { success: false, homeScore: 0, awayScore: 0 };
    }
  },

  async getOwnGoals(fixtureId: number) {
    console.log('🔍 Enhanced Own Goal Service: Getting own goals for fixture:', fixtureId);
    
    try {
      const { data: ownGoals, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .eq('is_own_goal', true)
        .order('event_time', { ascending: true });

      if (error) {
        console.error('❌ Enhanced Own Goal Service: Error fetching own goals:', error);
        return [];
      }

      console.log(`📊 Enhanced Own Goal Service: Found ${ownGoals?.length || 0} own goals`);
      return ownGoals || [];

    } catch (error) {
      console.error('❌ Enhanced Own Goal Service: Error in getOwnGoals:', error);
      return [];
    }
  }
};
