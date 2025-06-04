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

      // Assign the goal to the player and update stats
      await assignGoalToPlayer({
        fixtureId: data.fixtureId,
        playerId: data.playerId,
        playerName: data.playerName,
        teamId: data.teamId,
        eventTime: data.eventTime,
        type: data.goalType
      });

      // For goals (not assists), check if we need to update the fixture score
      let shouldUpdateScore = false;
      if (data.goalType === 'goal') {
        shouldUpdateScore = await this.shouldUpdateFixtureScore(data);
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
        shouldUpdateScore,
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

  async shouldUpdateFixtureScore(data: UnifiedGoalData): Promise<boolean> {
    console.log('🔍 UnifiedGoalService: Checking if fixture score needs updating');
    
    // Get current fixture score
    const { data: fixture, error } = await supabase
      .from('fixtures')
      .select('home_score, away_score, home_team_id, away_team_id')
      .eq('id', data.fixtureId)
      .single();

    if (error || !fixture) {
      console.error('❌ UnifiedGoalService: Error fetching fixture:', error);
      return false;
    }

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

    const totalHomeGoals = (homeGoals || []).length;
    const totalAwayGoals = (awayGoals || []).length;
    const currentHomeScore = fixture.home_score || 0;
    const currentAwayScore = fixture.away_score || 0;

    // Update needed if match_events goals don't match fixture scores
    const needsUpdate = totalHomeGoals !== currentHomeScore || totalAwayGoals !== currentAwayScore;
    
    console.log('📊 UnifiedGoalService: Score update check:', {
      totalHomeGoals,
      totalAwayGoals,
      currentHomeScore,
      currentAwayScore,
      needsUpdate
    });

    return needsUpdate;
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
