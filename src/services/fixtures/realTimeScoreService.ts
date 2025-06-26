
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from '@/services/operationLoggingService';

export interface ScoreUpdateResult {
  success: boolean;
  homeScore: number;
  awayScore: number;
  message?: string;
  error?: string;
}

export const realTimeScoreService = {
  /**
   * Update fixture score immediately when a goal is added/removed
   */
  async updateFixtureScoreRealTime(fixtureId: number): Promise<ScoreUpdateResult> {
    console.log('🔄 RealTimeScoreService: Updating fixture score in real-time for fixture:', fixtureId);
    
    try {
      // Get fixture and team information
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('id, home_team_id, away_team_id')
        .eq('id', fixtureId)
        .single();

      if (fixtureError || !fixture) {
        throw new Error(`Fixture not found: ${fixtureError?.message}`);
      }

      // Count all goals for proper score calculation
      const { data: allGoals, error: goalsError } = await supabase
        .from('match_events')
        .select('id, team_id, is_own_goal, scoring_team_id')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal');

      if (goalsError) {
        throw new Error(`Error fetching goals: ${goalsError.message}`);
      }

      let homeScore = 0;
      let awayScore = 0;

      // Calculate scores with proper own goal handling
      (allGoals || []).forEach(goal => {
        // Use scoring_team_id if available (handles own goals), otherwise fall back to team_id
        const scoringTeam = goal.scoring_team_id || goal.team_id;
        
        if (scoringTeam === fixture.home_team_id) {
          homeScore++;
        } else if (scoringTeam === fixture.away_team_id) {
          awayScore++;
        }
      });

      console.log('📊 RealTimeScoreService: Calculated scores:', { 
        homeScore, 
        awayScore,
        totalGoals: (allGoals || []).length,
        ownGoals: (allGoals || []).filter(g => g.is_own_goal).length
      });

      // Update fixture with new scores AND set status to completed
      const { error: updateError } = await supabase
        .from('fixtures')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: 'completed', // ✅ FIX: Set status to completed
          updated_at: new Date().toISOString()
        })
        .eq('id', fixtureId);

      if (updateError) {
        throw new Error(`Error updating fixture: ${updateError.message}`);
      }

      // Log the operation
      await operationLoggingService.logOperation({
        operation_type: 'real_time_score_update',
        table_name: 'fixtures',
        record_id: fixtureId.toString(),
        payload: {
          fixture_id: fixtureId,
          calculated_home_score: homeScore,
          calculated_away_score: awayScore,
          total_goal_events: (allGoals || []).length,
          status_updated: 'completed'
        },
        success: true
      });

      console.log('✅ RealTimeScoreService: Score updated successfully with completed status:', { homeScore, awayScore });

      return {
        success: true,
        homeScore,
        awayScore,
        message: `Match completed with score ${homeScore}-${awayScore}`
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ RealTimeScoreService: Error updating score:', errorMsg);

      await operationLoggingService.logOperation({
        operation_type: 'real_time_score_update',
        table_name: 'fixtures',
        record_id: fixtureId.toString(),
        error_message: errorMsg,
        success: false
      });

      return {
        success: false,
        homeScore: 0,
        awayScore: 0,
        error: errorMsg
      };
    }
  },

  /**
   * Verify score synchronization between fixture table and goal events
   */
  async verifyScoreSync(fixtureId: number): Promise<{
    isInSync: boolean;
    fixtureScores: { home: number; away: number };
    calculatedScores: { home: number; away: number };
    discrepancy?: string;
  }> {
    console.log('🔍 RealTimeScoreService: Verifying score synchronization for fixture:', fixtureId);

    try {
      // Get current fixture scores
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('home_score, away_score, home_team_id, away_team_id')
        .eq('id', fixtureId)
        .single();

      if (fixtureError || !fixture) {
        throw new Error('Fixture not found');
      }

      // Calculate scores from goal events
      const { data: goals, error: goalsError } = await supabase
        .from('match_events')
        .select('team_id, scoring_team_id, is_own_goal')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal');

      if (goalsError) {
        throw new Error('Error fetching goals');
      }

      let calculatedHome = 0;
      let calculatedAway = 0;

      (goals || []).forEach(goal => {
        const scoringTeam = goal.scoring_team_id || goal.team_id;
        if (scoringTeam === fixture.home_team_id) {
          calculatedHome++;
        } else if (scoringTeam === fixture.away_team_id) {
          calculatedAway++;
        }
      });

      const fixtureScores = {
        home: fixture.home_score || 0,
        away: fixture.away_score || 0
      };

      const calculatedScores = {
        home: calculatedHome,
        away: calculatedAway
      };

      const isInSync = 
        fixtureScores.home === calculatedScores.home && 
        fixtureScores.away === calculatedScores.away;

      const result = {
        isInSync,
        fixtureScores,
        calculatedScores,
        discrepancy: isInSync ? undefined : 
          `Fixture shows ${fixtureScores.home}-${fixtureScores.away}, but goals calculate to ${calculatedScores.home}-${calculatedScores.away}`
      };

      console.log('🔍 RealTimeScoreService: Score sync verification:', result);
      return result;

    } catch (error) {
      console.error('❌ RealTimeScoreService: Error verifying sync:', error);
      return {
        isInSync: false,
        fixtureScores: { home: 0, away: 0 },
        calculatedScores: { home: 0, away: 0 },
        discrepancy: 'Error during verification'
      };
    }
  }
};
