import { supabase } from '@/integrations/supabase/client';
import { assignGoalToPlayer } from './fixtures/simplifiedGoalAssignmentService';
import { enhancedDuplicatePreventionService } from './fixtures/enhancedDuplicatePreventionService';
import { enhancedOwnGoalService } from './fixtures/enhancedOwnGoalService';

interface UnifiedGoalData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  teamName: string;
  goalType: 'goal' | 'assist';
  eventTime: number;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  isOwnGoal?: boolean; // Standardized own goal flag
}

interface UnifiedGoalResult {
  success: boolean;
  goalEventId?: number;
  duplicatePreventionApplied?: boolean;
  scoreUpdated?: boolean;
  homeScore?: number;
  awayScore?: number;
  message?: string;
  error?: string;
}

export const unifiedGoalService = {
  async addGoal(data: UnifiedGoalData): Promise<UnifiedGoalResult> {
    console.log('🎯 Unified Goal Service: Processing goal with standardized own goal support:', data);
    
    try {
      // Enhanced duplicate prevention check - fix method name and use correct properties
      const duplicateCheck = await enhancedDuplicatePreventionService.checkForDuplicateEvent({
        fixtureId: data.fixtureId,
        playerName: data.playerName,
        eventTime: data.eventTime,
        eventType: data.goalType,
        teamId: data.teamId,
        isOwnGoal: data.isOwnGoal || false // Include own goal in duplicate check
      });

      if (duplicateCheck.isDuplicate) {
        console.log('⚠️ Unified Goal Service: Duplicate prevention triggered');
        return {
          success: false,
          duplicatePreventionApplied: true,
          error: duplicateCheck.message || 'Duplicate goal detected',
          message: 'Goal not added due to duplicate detection'
        };
      }

      // Route to appropriate service based on own goal flag
      if (data.isOwnGoal) {
        console.log('🥅 Unified Goal Service: Routing to enhanced own goal service');
        const ownGoalResult = await enhancedOwnGoalService.addOwnGoal({
          fixtureId: data.fixtureId,
          playerId: data.playerId,
          playerName: data.playerName,
          playerTeamId: data.teamId,
          playerTeamName: data.teamName,
          eventTime: data.eventTime,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam
        });

        return {
          success: ownGoalResult.success,
          goalEventId: ownGoalResult.goalEventId,
          scoreUpdated: ownGoalResult.scoreUpdated,
          homeScore: ownGoalResult.homeScore,
          awayScore: ownGoalResult.awayScore,
          message: ownGoalResult.message,
          error: ownGoalResult.error
        };
      } else {
        console.log('⚽ Unified Goal Service: Routing to regular goal assignment service');
        const goalResult = await assignGoalToPlayer({
          fixtureId: data.fixtureId,
          playerId: data.playerId,
          playerName: data.playerName,
          teamId: data.teamId,
          eventTime: data.eventTime,
          type: data.goalType,
          isOwnGoal: false // Explicit regular goal
        });

        // Update fixture score for regular goals
        const scoreUpdateResult = await this.updateFixtureScoreForRegularGoal(
          data.fixtureId,
          data.homeTeam,
          data.awayTeam
        );

        return {
          success: goalResult.success,
          goalEventId: goalResult.eventId,
          scoreUpdated: scoreUpdateResult.success,
          homeScore: scoreUpdateResult.homeScore,
          awayScore: scoreUpdateResult.awayScore,
          message: `${data.goalType === 'goal' ? 'Goal' : 'Assist'} recorded for ${data.playerName}${scoreUpdateResult.success ? ' and score updated' : ''}`
        };
      }

    } catch (error) {
      console.error('❌ Unified Goal Service: Error processing goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process goal',
        message: 'Goal processing failed'
      };
    }
  },

  async updateFixtureScoreForRegularGoal(
    fixtureId: number,
    homeTeam: any,
    awayTeam: any
  ): Promise<{ success: boolean; homeScore: number; awayScore: number }> {
    console.log('📊 Unified Goal Service: Updating fixture score for regular goal');
    
    try {
      const homeTeamId = homeTeam.__id__ || homeTeam.id;
      const awayTeamId = awayTeam.__id__ || awayTeam.id;

      // Count all goals (regular + own goals that benefit each team)
      const { data: homeGoals } = await supabase
        .from('match_events')
        .select('id, team_id, is_own_goal')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal');

      let homeScore = 0;
      let awayScore = 0;

      (homeGoals || []).forEach(goal => {
        if (goal.is_own_goal) {
          // Own goal benefits the opposing team
          if (goal.team_id === homeTeamId) {
            awayScore++;
          } else if (goal.team_id === awayTeamId) {
            homeScore++;
          }
        } else {
          // Regular goal benefits the scoring team
          if (goal.team_id === homeTeamId) {
            homeScore++;
          } else if (goal.team_id === awayTeamId) {
            awayScore++;
          }
        }
      });

      console.log('📊 Unified Goal Service: Calculated scores with standardized own goal logic:', { 
        homeScore, 
        awayScore 
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
        console.error('❌ Unified Goal Service: Error updating fixture score:', updateError);
        return { success: false, homeScore: 0, awayScore: 0 };
      }

      console.log('✅ Unified Goal Service: Fixture score updated:', { homeScore, awayScore });
      return { success: true, homeScore, awayScore };

    } catch (error) {
      console.error('❌ Unified Goal Service: Error in updateFixtureScoreForRegularGoal:', error);
      return { success: false, homeScore: 0, awayScore: 0 };
    }
  }
};
