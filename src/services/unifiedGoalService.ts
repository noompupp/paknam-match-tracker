
import { supabase } from '@/integrations/supabase/client';
import { assignGoalToPlayer } from './fixtures/goalAssignmentService';
import { resolveTeamIdForMatchEvent } from '@/utils/teamIdMapping';
import { enhancedDuplicatePreventionService } from './fixtures/enhancedDuplicatePreventionService';

interface UnifiedGoalData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  goalType: 'goal' | 'assist';
  eventTime: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
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
    console.log('⚽ UnifiedGoalService: Starting unified goal assignment with enhanced duplicate prevention:', data);
    
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

      // Check for and remove any "Unknown Player" placeholder events before assignment
      await this.removeUnknownPlayerPlaceholders(data.fixtureId, data.teamId, data.goalType);

      // Assign the goal to the player and update stats
      await assignGoalToPlayer({
        fixtureId: data.fixtureId,
        playerId: data.playerId,
        playerName: data.playerName,
        teamId: data.teamId,
        eventTime: data.eventTime,
        type: data.goalType
      });

      // For goals (not assists), update the fixture score automatically
      let autoScoreUpdated = false;
      if (data.goalType === 'goal') {
        autoScoreUpdated = await this.updateFixtureScoreAfterGoal(data);
      }

      console.log('✅ UnifiedGoalService: Goal assignment completed successfully with enhanced duplicate prevention');
      
      return {
        success: true,
        goalData: {
          playerId: data.playerId,
          playerName: data.playerName,
          team: data.teamName,
          time: data.eventTime,
          type: data.goalType
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

  async removeUnknownPlayerPlaceholders(fixtureId: number, teamId: number, eventType: 'goal' | 'assist'): Promise<void> {
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
      // Count total goals for each team from match_events
      const { data: homeGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', data.fixtureId)
        .eq('team_id', data.homeTeam.id)
        .eq('event_type', 'goal');

      const { data: awayGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', data.fixtureId)
        .eq('team_id', data.awayTeam.id)
        .eq('event_type', 'goal');

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

  async checkForDuplicateGoal(data: UnifiedGoalData): Promise<boolean> {
    console.log('🔍 UnifiedGoalService: Checking for duplicate goals');
    
    const { data: existingEvents, error } = await supabase
      .from('match_events')
      .select('id')
      .eq('fixture_id', data.fixtureId)
      .eq('player_name', data.playerName)
      .eq('event_type', data.goalType)
      .eq('event_time', data.eventTime)
      .eq('team_id', data.teamId);

    if (error) {
      console.error('❌ UnifiedGoalService: Error checking for duplicates:', error);
      return false;
    }

    return (existingEvents || []).length > 0;
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
    if (!data.teamId || data.teamId <= 0) {
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
