import { supabase } from '@/integrations/supabase/client';
import { assignGoalToPlayer } from './fixtures/simplifiedGoalAssignmentService';
import { enhancedDuplicatePreventionService } from './fixtures/enhancedDuplicatePreventionService';
import { enhancedOwnGoalService } from './fixtures/enhancedOwnGoalService';
import { realTimeScoreService } from './fixtures/realTimeScoreService';
import { logMatchEventModification } from "./modificationLogService";

interface UnifiedGoalData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  teamName: string;
  goalType: 'goal' | 'assist';
  eventTime: number;
  homeTeam: { id: string; name: string; __id__?: string };
  awayTeam: { id: string; name: string; __id__?: string };
  isOwnGoal?: boolean;
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
    console.log('🎯 Unified Goal Service: Processing goal with real-time score update:', data);
    
    try {
      // Enhanced input validation
      if (!data.fixtureId || data.fixtureId <= 0) {
        throw new Error('Invalid fixture ID provided');
      }
      
      if (!data.playerName || data.playerName.trim().length === 0) {
        throw new Error('Invalid player name provided');
      }
      
      if (!data.teamId || data.teamId.trim().length === 0) {
        throw new Error('Invalid team ID provided');
      }
      
      if (!data.homeTeam?.id || !data.awayTeam?.id) {
        throw new Error('Invalid team data provided');
      }

      // Sanitize team ID
      const sanitizedTeamId = data.teamId.trim();
      console.log('🔍 Unified Goal Service: Using sanitized team ID:', sanitizedTeamId);

      // Enhanced duplicate prevention check
      const duplicateCheck = await enhancedDuplicatePreventionService.checkForDuplicateEvent({
        fixtureId: data.fixtureId,
        playerName: data.playerName.trim(),
        eventTime: data.eventTime,
        eventType: data.goalType,
        teamId: sanitizedTeamId,
        isOwnGoal: data.isOwnGoal || false
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

      let goalResult: any;
      let scoreUpdateResult: any;

      // Route to appropriate service based on own goal flag
      if (data.isOwnGoal) {
        console.log('🥅 Unified Goal Service: Routing to enhanced own goal service');
        goalResult = await enhancedOwnGoalService.addOwnGoal({
          fixtureId: data.fixtureId,
          playerId: data.playerId,
          playerName: data.playerName.trim(),
          playerTeamId: sanitizedTeamId,
          playerTeamName: data.teamName,
          eventTime: data.eventTime,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam
        });

        // Own goal service handles its own score updates
        return {
          success: goalResult.success,
          goalEventId: goalResult.goalEventId,
          scoreUpdated: goalResult.scoreUpdated,
          homeScore: goalResult.homeScore,
          awayScore: goalResult.awayScore,
          message: goalResult.message,
          error: goalResult.error
        };
      } else {
        console.log('⚽ Unified Goal Service: Routing to regular goal assignment service');
        goalResult = await assignGoalToPlayer({
          fixtureId: data.fixtureId,
          playerId: data.playerId,
          playerName: data.playerName.trim(),
          teamId: sanitizedTeamId,
          eventTime: data.eventTime,
          type: data.goalType,
          isOwnGoal: false
        });

        // For regular goals, trigger real-time score update
        if (goalResult.success && data.goalType === 'goal') {
          console.log('🔄 Unified Goal Service: Triggering real-time score update for regular goal');
          scoreUpdateResult = await realTimeScoreService.updateFixtureScoreRealTime(data.fixtureId);
        } else {
          // For assists, no score update needed
          scoreUpdateResult = { success: true, homeScore: 0, awayScore: 0 };
        }

        return {
          success: goalResult.success,
          goalEventId: goalResult.eventId,
          scoreUpdated: scoreUpdateResult.success,
          homeScore: scoreUpdateResult.homeScore,
          awayScore: scoreUpdateResult.awayScore,
          message: `${data.goalType === 'goal' ? 'Goal' : 'Assist'} recorded for ${data.playerName}${scoreUpdateResult.success && data.goalType === 'goal' ? ' and score updated in real-time' : ''}`
        };
      }

    } catch (error) {
      console.error('❌ Unified Goal Service: Error processing goal:', error);
      
      // Enhanced error context logging
      console.error('❌ Goal processing context:', {
        fixtureId: data.fixtureId,
        playerName: data.playerName,
        teamId: data.teamId,
        goalType: data.goalType,
        isOwnGoal: data.isOwnGoal
      });
      
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
        // Use scoring_team_id if available (handles own goals), otherwise fall back to team_id
        const scoringTeam = goal.scoring_team_id || goal.team_id;
        
        if (scoringTeam === homeTeamId) {
          homeScore++;
        } else if (scoringTeam === awayTeamId) {
          awayScore++;
        }
      });

      console.log('📊 Unified Goal Service: Calculated scores with enhanced logic:', { 
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
        console.error('❌ Unified Goal Service: Error updating fixture score:', updateError);
        return { success: false, homeScore: 0, awayScore: 0 };
      }

      console.log('✅ Unified Goal Service: Fixture score updated successfully:', { homeScore, awayScore });
      return { success: true, homeScore, awayScore };

    } catch (error) {
      console.error('❌ Unified Goal Service: Error in updateFixtureScoreForRegularGoal:', error);
      return { success: false, homeScore: 0, awayScore: 0 };
    }
  },

  /**
   * Example: Log edit when a goal is modified, for completed fixture.
   * Usage: Call this from the event edit handler WITH THE CORRECT userId.
   */
  async logModificationIfCompleted({
    fixtureId,
    userId,
    eventType,
    action,
    prevData,
    newData,
    notes,
  }: {
    fixtureId: number;
    userId: string;
    eventType: string;
    action: string;
    prevData: any;
    newData?: any;
    notes?: string;
  }) {
    // Check if fixture is completed before logging
    const { data: fixture, error } = await supabase
      .from("fixtures")
      .select("status")
      .eq("id", fixtureId)
      .maybeSingle();

    if (error) {
      console.warn("Error checking fixture status for logging:", error);
      return;
    }
    if (fixture?.status !== "completed") {
      // Only log if fixture is completed
      return;
    }
    await logMatchEventModification({
      fixtureId,
      userId,
      eventType,
      action,
      prevData,
      newData,
      notes,
    });
  }
};
