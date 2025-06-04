
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedPlayerStats {
  id: number;
  name: string;
  position: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  totalMinutesPlayed: number;
  matchesPlayed: number;
  team: string;
}

export const useEnhancedTeamPlayerStats = (teamId?: number) => {
  return useQuery({
    queryKey: ['enhancedTeamPlayerStats', teamId],
    queryFn: async (): Promise<EnhancedPlayerStats[]> => {
      if (!teamId) return [];
      
      console.log('🎣 useEnhancedTeamPlayerStats: Fetching enhanced stats for team:', teamId);
      
      try {
        // Get team info first to get the team name and ID format
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('name, __id__')
          .eq('id', teamId)
          .single();

        if (teamError) {
          console.error('❌ useEnhancedTeamPlayerStats: Error fetching team:', teamError);
          throw teamError;
        }

        if (!team) {
          console.warn('⚠️ useEnhancedTeamPlayerStats: Team not found:', teamId);
          return [];
        }

        // Fetch members with enhanced stats
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select(`
            id,
            name,
            position,
            goals,
            assists,
            yellow_cards,
            red_cards,
            total_minutes_played,
            matches_played
          `)
          .eq('team_id', team.__id__);

        if (membersError) {
          console.error('❌ useEnhancedTeamPlayerStats: Error fetching members:', membersError);
          throw membersError;
        }

        const enhancedStats: EnhancedPlayerStats[] = (members || []).map(member => ({
          id: member.id,
          name: member.name || 'Unknown Player',
          position: member.position || 'Player',
          goals: member.goals || 0,
          assists: member.assists || 0,
          yellowCards: member.yellow_cards || 0,
          redCards: member.red_cards || 0,
          totalMinutesPlayed: member.total_minutes_played || 0,
          matchesPlayed: member.matches_played || 0,
          team: team.name
        }));

        console.log('✅ useEnhancedTeamPlayerStats: Successfully fetched enhanced stats:', {
          teamName: team.name,
          playersCount: enhancedStats.length,
          totalMinutes: enhancedStats.reduce((sum, p) => sum + p.totalMinutesPlayed, 0),
          totalGoals: enhancedStats.reduce((sum, p) => sum + p.goals, 0)
        });

        return enhancedStats;

      } catch (error) {
        console.error('❌ useEnhancedTeamPlayerStats: Critical error:', error);
        throw error;
      }
    },
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });
};
