
import { supabase } from '@/integrations/supabase/client';
import { resolveTeamIdForMatchEvent } from '@/utils/teamIdMapping';

interface QuickGoalData {
  fixtureId: number;
  team: 'home' | 'away';
  matchTime: number;
  homeTeam: { id: string; name: string; __id__?: string };
  awayTeam: { id: string; name: string; __id__?: string };
}

interface QuickGoalResult {
  success: boolean;
  goalEventId?: number;
  scoreUpdated?: boolean;
  message?: string;
  error?: string;
}

export const quickGoalService = {
  async addQuickGoal(data: QuickGoalData): Promise<QuickGoalResult> {
    console.log('⚡ QuickGoalService: Adding quick goal:', data);
    
    try {
      // Validate input data
      if (!data.fixtureId || !data.team || data.matchTime < 0) {
        throw new Error('Invalid quick goal data provided');
      }

      // Determine which team scored
      const scoringTeam = data.team === 'home' ? data.homeTeam : data.awayTeam;
      const teamId = resolveTeamIdForMatchEvent(scoringTeam.name, data.homeTeam, data.awayTeam);

      console.log('🎯 QuickGoalService: Resolved team data:', {
        scoringTeam: scoringTeam.name,
        teamId,
        team: data.team
      });

      // Create quick goal event with "Quick Goal" as player name
      const { data: goalEvent, error: eventError } = await supabase
        .from('match_events')
        .insert({
          fixture_id: data.fixtureId,
          event_type: 'goal',
          player_name: 'Quick Goal',
          team_id: teamId,
          event_time: data.matchTime,
          description: `Quick goal for ${scoringTeam.name} at ${Math.floor(data.matchTime / 60)}'${String(data.matchTime % 60).padStart(2, '0')}`
        })
        .select()
        .single();

      if (eventError) {
        console.error('❌ QuickGoalService: Error creating goal event:', eventError);
        throw new Error(`Failed to create goal event: ${eventError.message}`);
      }

      console.log('✅ QuickGoalService: Goal event created:', goalEvent);

      // Update fixture score
      const scoreUpdateResult = await this.updateFixtureScore(data.fixtureId, data.homeTeam, data.awayTeam);

      return {
        success: true,
        goalEventId: goalEvent.id,
        scoreUpdated: scoreUpdateResult.success,
        message: `Quick goal added for ${scoringTeam.name}${scoreUpdateResult.success ? ' and score updated' : ''}`
      };

    } catch (error) {
      console.error('❌ QuickGoalService: Error adding quick goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add quick goal',
        message: 'Failed to add quick goal'
      };
    }
  },

  async updateFixtureScore(fixtureId: number, homeTeam: any, awayTeam: any): Promise<{ success: boolean; homeScore: number; awayScore: number }> {
    console.log('📊 QuickGoalService: Updating fixture score');
    
    try {
      // Count goals for each team
      const homeTeamId = homeTeam.__id__ || homeTeam.id;
      const awayTeamId = awayTeam.__id__ || awayTeam.id;

      const { data: homeGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('team_id', homeTeamId)
        .eq('event_type', 'goal');

      const { data: awayGoals } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('team_id', awayTeamId)
        .eq('event_type', 'goal');

      const homeScore = (homeGoals || []).length;
      const awayScore = (awayGoals || []).length;

      // Update fixture
      const { error: updateError } = await supabase
        .from('fixtures')
        .update({
          home_score: homeScore,
          away_score: awayScore
        })
        .eq('id', fixtureId);

      if (updateError) {
        console.error('❌ QuickGoalService: Error updating fixture score:', updateError);
        return { success: false, homeScore: 0, awayScore: 0 };
      }

      console.log('✅ QuickGoalService: Fixture score updated:', { homeScore, awayScore });
      return { success: true, homeScore, awayScore };

    } catch (error) {
      console.error('❌ QuickGoalService: Error in updateFixtureScore:', error);
      return { success: false, homeScore: 0, awayScore: 0 };
    }
  },

  async getQuickGoals(fixtureId: number) {
    console.log('🔍 QuickGoalService: Getting quick goals for fixture:', fixtureId);
    
    try {
      const { data: quickGoals, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .eq('player_name', 'Quick Goal')
        .order('event_time', { ascending: true });

      if (error) {
        console.error('❌ QuickGoalService: Error fetching quick goals:', error);
        return [];
      }

      console.log(`📊 QuickGoalService: Found ${quickGoals?.length || 0} quick goals`);
      return quickGoals || [];

    } catch (error) {
      console.error('❌ QuickGoalService: Error in getQuickGoals:', error);
      return [];
    }
  }
};
