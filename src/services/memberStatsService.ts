
import { supabase } from '@/integrations/supabase/client';

export interface TopScorerData {
  id: number;
  name: string;
  team_name: string;
  goals: number;
  assists: number;
  total_minutes_played: number;
  matches_played: number;
  regular_goals: number; // Goals excluding own goals
  own_goals: number;
}

export const memberStatsService = {
  async getTopScorers(limit: number = 10, excludeOwnGoals: boolean = true): Promise<TopScorerData[]> {
    console.log('🏆 Getting top scorers with own goal filtering:', { limit, excludeOwnGoals });
    
    try {
      // Get member stats with team information
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select(`
          id,
          name,
          goals,
          assists,
          total_minutes_played,
          matches_played,
          team_id,
          teams:team_id (
            name
          )
        `)
        .order('goals', { ascending: false })
        .limit(limit * 2); // Get more to account for filtering

      if (membersError) throw membersError;

      if (!members || members.length === 0) {
        return [];
      }

      // Get own goals count for each member if excluding own goals
      const topScorers: TopScorerData[] = [];
      
      for (const member of members) {
        let regularGoals = member.goals || 0;
        let ownGoals = 0;

        if (excludeOwnGoals) {
          // Count own goals for this member
          const { data: ownGoalEvents, error: ownGoalsError } = await supabase
            .from('match_events')
            .select('id')
            .eq('player_name', member.name)
            .eq('event_type', 'goal')
            .eq('own_goal', true);

          if (ownGoalsError) {
            console.error('Error fetching own goals for member:', member.name, ownGoalsError);
          } else {
            ownGoals = ownGoalEvents?.length || 0;
            regularGoals = Math.max(0, (member.goals || 0) - ownGoals);
          }
        }

        // Only include players with goals (regular goals if excluding own goals)
        const goalCount = excludeOwnGoals ? regularGoals : (member.goals || 0);
        if (goalCount > 0) {
          topScorers.push({
            id: member.id,
            name: member.name || '',
            team_name: member.teams?.name || 'Unknown Team',
            goals: member.goals || 0,
            assists: member.assists || 0,
            total_minutes_played: member.total_minutes_played || 0,
            matches_played: member.matches_played || 0,
            regular_goals: regularGoals,
            own_goals: ownGoals
          });
        }
      }

      // Sort by appropriate goal count and limit results
      const sortKey = excludeOwnGoals ? 'regular_goals' : 'goals';
      return topScorers
        .sort((a, b) => (b as any)[sortKey] - (a as any)[sortKey])
        .slice(0, limit);

    } catch (error) {
      console.error('❌ Error fetching top scorers:', error);
      throw error;
    }
  },

  async getMemberGoalBreakdown(memberId: number): Promise<{
    totalGoals: number;
    regularGoals: number;
    ownGoals: number;
    assists: number;
  }> {
    try {
      // Get member's total goals from member stats
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('goals, assists, name')
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;

      // Count own goals from match events
      const { data: ownGoalEvents, error: ownGoalsError } = await supabase
        .from('match_events')
        .select('id')
        .eq('player_name', member.name)
        .eq('event_type', 'goal')
        .eq('own_goal', true);

      if (ownGoalsError) throw ownGoalsError;

      const totalGoals = member.goals || 0;
      const ownGoals = ownGoalEvents?.length || 0;
      const regularGoals = Math.max(0, totalGoals - ownGoals);

      return {
        totalGoals,
        regularGoals,
        ownGoals,
        assists: member.assists || 0
      };

    } catch (error) {
      console.error('❌ Error fetching member goal breakdown:', error);
      throw error;
    }
  }
};
