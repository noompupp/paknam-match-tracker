
import { supabase } from '@/integrations/supabase/client';
import { assignGoalToPlayer } from './fixtures/goalAssignmentService';
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
  isOwnGoal?: boolean;
}

interface GoalResult {
  success: boolean;
  goalData?: any;
  shouldUpdateScore?: boolean;
  message?: string;
  duplicatePrevented?: boolean;
  autoScoreUpdated?: boolean;
}

export const unifiedGoalService = {
  async assignGoalWithScoreUpdate(data: UnifiedGoalData): Promise<GoalResult> {
    console.log('⚽ UnifiedGoalService: Starting unified goal assignment with enhanced own goal support:', data);
    
    try {
      // Validate input data
      this.validateGoalData(data);

      // Enhanced duplicate check
      const duplicateCheck = await enhancedDuplicatePreventionService.checkForDuplicateEvent({
        fixtureId: data.fixtureId,
        teamId: data.teamId,
        playerName: data.playerName,
        eventTime: data.eventTime,
        eventType: data.goalType
      });

      if (duplicateCheck.isDuplicate) {
        console.warn('⚠️ UnifiedGoalService: Enhanced duplicate detection prevented goal assignment:', duplicateCheck);
        return {
          success: false,
          message: duplicateCheck.message || 'Duplicate goal/assist prevented',
          duplicatePrevented: true
        };
      }

      // Handle own goals with enhanced service
      if (data.goalType === 'goal' && data.isOwnGoal) {
        console.log('🎯 UnifiedGoalService: Processing as own goal');
        
        const ownGoalResult = await enhancedOwnGoalService.recordOwnGoal({
          fixtureId: data.fixtureId,
          playerId: data.playerId,
          playerName: data.playerName,
          playerTeamId: data.teamId,
          eventTime: data.eventTime,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam
        });

        if (!ownGoalResult.success) {
          return {
            success: false,
            message: ownGoalResult.error || 'Failed to record own goal'
          };
        }

        return {
          success: true,
          goalData: {
            playerId: data.playerId,
            playerName: data.playerName,
            team: data.teamName,
            time: data.eventTime,
            type: 'goal',
            isOwnGoal: true,
            scoringTeamId: ownGoalResult.scoringTeamId,
            affectedTeamId: ownGoalResult.affectedTeamId
          },
          shouldUpdateScore: true,
          autoScoreUpdated: true,
          message: ownGoalResult.message,
          duplicatePrevented: false
        };
      }

      // Handle regular goals and assists
      await this.removeUnknownPlayerPlaceholders(data.fixtureId, data.teamId, data.goalType);

      // Assign the goal to the player and update stats
      await assignGoalToPlayer({
        fixtureId: data.fixtureId,
        playerId: data.playerId,
        playerName: data.playerName,
        teamId: data.teamId,
        eventTime: data.eventTime,
        type: data.goalType,
        isOwnGoal: false
      });

      // For goals (not assists), update the fixture score automatically
      let autoScoreUpdated = false;
      if (data.goalType === 'goal') {
        autoScoreUpdated = await this.updateFixtureScoreAfterGoal(data);
      }

      console.log('✅ UnifiedGoalService: Goal assignment completed successfully');
      
      return {
        success: true,
        goalData: {
          playerId: data.playerId,
          playerName: data.playerName,
          team: data.teamName,
          time: data.eventTime,
          type: data.goalType,
          isOwnGoal: false
        },
        shouldUpdateScore: autoScoreUpdated,
        autoScoreUpdated,
        message: `${data.goalType === 'goal' ? 'Goal' : 'Assist'} assigned successfully`,
        duplicatePrevented: false
      };

    } catch (error) {
      console.error('❌ UnifiedGoalService: Error in unified goal assignment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign goal'
      };
    }
  },

  async removeUnknownPlayerPlaceholders(fixtureId: number, teamId: string, eventType: 'goal' | 'assist'): Promise<void> {
    console.log('🧹 UnifiedGoalService: Removing Unknown Player placeholders for:', { fixtureId, teamId, eventType });
    
    try {
      const { data: unknownEvents, error: fetchError } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('team_id', teamId)
        .eq('event_type', eventType)
        .eq('player_name', 'Unknown Player');

      if (fetchError) {
        console.error('❌ UnifiedGoalService: Error fetching unknown player events:', fetchError);
        return;
      }

      if (unknownEvents && unknownEvents.length > 0) {
        const { error: deleteError } = await supabase
          .from('match_events')
          .delete()
          .in('id', unknownEvents.map(e => e.id));

        if (deleteError) {
          console.error('❌ UnifiedGoalService: Error deleting unknown player events:', deleteError);
        } else {
          console.log(`✅ UnifiedGoalService: Removed ${unknownEvents.length} Unknown Player placeholders`);
        }
      }
    } catch (error) {
      console.error('❌ UnifiedGoalService: Error in removeUnknownPlayerPlaceholders:', error);
    }
  },

  async updateFixtureScoreAfterGoal(data: UnifiedGoalData): Promise<boolean> {
    console.log('📊 UnifiedGoalService: Updating fixture score after goal assignment');
    
    try {
      // Use enhanced scoring logic that considers own goals
      const { data: homeGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', data.fixtureId)
        .eq('event_type', 'goal')
        .eq('scoring_team_id', data.homeTeam.id);

      const { data: awayGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', data.fixtureId)
        .eq('event_type', 'goal')
        .eq('scoring_team_id', data.awayTeam.id);

      const homeScore = (homeGoals || []).length;
      const awayScore = (awayGoals || []).length;

      // Update fixture with calculated scores
      const { error: updateError } = await supabase
        .from('fixtures')
        .update({
          home_score: homeScore,
          away_score: awayScore
        })
        .eq('id', data.fixtureId);

      if (updateError) {
        console.error('❌ UnifiedGoalService: Error updating fixture score:', updateError);
        return false;
      }

      console.log('✅ UnifiedGoalService: Fixture score updated successfully:', { homeScore, awayScore });
      return true;

    } catch (error) {
      console.error('❌ UnifiedGoalService: Error in updateFixtureScoreAfterGoal:', error);
      return false;
    }
  },

  validateGoalData(data: UnifiedGoalData): void {
    if (!data.fixtureId || data.fixtureId <= 0) {
      throw new Error('Invalid fixture ID');
    }
    if (!data.playerId || data.playerId <= 0) {
      throw new Error('Invalid player ID');
    }
    if (!data.playerName?.trim()) {
      throw new Error('Player name is required');
    }
    if (!data.teamId?.trim()) {
      throw new Error('Invalid team ID');
    }
    if (!['goal', 'assist'].includes(data.goalType)) {
      throw new Error('Invalid goal type');
    }
    if (data.eventTime < 0) {
      throw new Error('Invalid event time');
    }
    if (!data.homeTeam?.id || !data.awayTeam?.id) {
      throw new Error('Invalid team data');
    }
  },

  async getFixtureGoalSummary(fixtureId: number) {
    console.log('📊 UnifiedGoalService: Getting fixture goal summary:', fixtureId);
    
    const { data: goals, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .in('event_type', ['goal', 'assist'])
      .neq('player_name', 'Unknown Player')
      .order('event_time', { ascending: true });

    if (error) {
      console.error('❌ UnifiedGoalService: Error fetching goal summary:', error);
      return [];
    }

    return goals || [];
  },

  async cleanupDuplicateGoals(): Promise<{ success: boolean; removedCount: number; errors: string[] }> {
    console.log('🧹 UnifiedGoalService: Cleaning up duplicate goals...');
    
    try {
      const result = await enhancedDuplicatePreventionService.cleanupAllDuplicateEvents();
      
      return {
        success: result.errors.length === 0,
        removedCount: result.removedCount,
        errors: result.errors
      };
    } catch (error) {
      console.error('❌ UnifiedGoalService: Error during cleanup:', error);
      return {
        success: false,
        removedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown cleanup error']
      };
    }
  }
};
