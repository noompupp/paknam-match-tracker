
import { supabase } from '@/integrations/supabase/client';

export interface PlayerStatsData {
  id: number;
  name: string;
  team_name: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  total_minutes_played: number;
  matches_played: number;
}

export const playerStatsApi = {
  async getTopScorers(limit: number = 10): Promise<PlayerStatsData[]> {
    console.log('🏆 PlayerStatsAPI: Fetching top scorers with fallback strategy...');
    
    try {
      // Primary query: try with joins first
      const { data: primaryData, error: primaryError } = await supabase
        .from('members')
        .select(`
          id,
          name,
          goals,
          assists,
          yellow_cards,
          red_cards,
          total_minutes_played,
          matches_played,
          teams(name)
        `)
        .gt('goals', 0)
        .order('goals', { ascending: false })
        .limit(limit);

      if (!primaryError && primaryData && primaryData.length > 0) {
        console.log('✅ PlayerStatsAPI: Primary query successful:', primaryData.length);
        return primaryData.map(player => ({
          id: player.id,
          name: player.name || 'Unknown Player',
          team_name: player.teams?.name || 'Unknown Team',
          goals: player.goals || 0,
          assists: player.assists || 0,
          yellow_cards: player.yellow_cards || 0,
          red_cards: player.red_cards || 0,
          total_minutes_played: player.total_minutes_played || 0,
          matches_played: player.matches_played || 0
        }));
      }

      console.warn('⚠️ PlayerStatsAPI: Top scorers primary query failed, using fallback');
      console.log('🔄 PlayerStatsAPI: Using fallback query strategy...');
      
      // Fallback: Get all members and teams separately
      const { data: allMembers, error: membersError } = await supabase
        .from('members')
        .select('*')
        .gt('goals', 0)
        .order('goals', { ascending: false })
        .limit(limit);

      if (membersError) {
        throw membersError;
      }

      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, __id__, name');

      if (teamsError) {
        throw teamsError;
      }

      console.log('✅ PlayerStatsAPI: Fallback query successful:', allMembers?.length || 0);

      return (allMembers || []).map(player => {
        const team = allTeams?.find(t => t.__id__ === player.team_id || t.id.toString() === player.team_id);
        return {
          id: player.id,
          name: player.name || 'Unknown Player',
          team_name: team?.name || 'Unknown Team',
          goals: player.goals || 0,
          assists: player.assists || 0,
          yellow_cards: player.yellow_cards || 0,
          red_cards: player.red_cards || 0,
          total_minutes_played: player.total_minutes_played || 0,
          matches_played: player.matches_played || 0
        };
      });

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Error fetching top scorers:', error);
      throw error;
    }
  },

  async getTopAssists(limit: number = 10): Promise<PlayerStatsData[]> {
    console.log('🎯 PlayerStatsAPI: Fetching top assists with fallback strategy...');
    
    try {
      // Primary query: try with joins first
      const { data: primaryData, error: primaryError } = await supabase
        .from('members')
        .select(`
          id,
          name,
          goals,
          assists,
          yellow_cards,
          red_cards,
          total_minutes_played,
          matches_played,
          teams(name)
        `)
        .gt('assists', 0)
        .order('assists', { ascending: false })
        .limit(limit);

      if (!primaryError && primaryData && primaryData.length > 0) {
        console.log('✅ PlayerStatsAPI: Primary assists query successful:', primaryData.length);
        return primaryData.map(player => ({
          id: player.id,
          name: player.name || 'Unknown Player',
          team_name: player.teams?.name || 'Unknown Team',
          goals: player.goals || 0,
          assists: player.assists || 0,
          yellow_cards: player.yellow_cards || 0,
          red_cards: player.red_cards || 0,
          total_minutes_played: player.total_minutes_played || 0,
          matches_played: player.matches_played || 0
        }));
      }

      console.warn('⚠️ PlayerStatsAPI: Top assists primary query failed, using fallback');
      console.log('🔄 PlayerStatsAPI: Using fallback query strategy...');
      
      // Fallback: Get all members and teams separately
      const { data: allMembers, error: membersError } = await supabase
        .from('members')
        .select('*')
        .gt('assists', 0)
        .order('assists', { ascending: false })
        .limit(limit);

      if (membersError) {
        throw membersError;
      }

      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, __id__, name');

      if (teamsError) {
        throw teamsError;
      }

      console.log('✅ PlayerStatsAPI: Fallback query successful:', allMembers?.length || 0);

      return (allMembers || []).map(player => {
        const team = allTeams?.find(t => t.__id__ === player.team_id || t.id.toString() === player.team_id);
        return {
          id: player.id,
          name: player.name || 'Unknown Player',
          team_name: team?.name || 'Unknown Team',
          goals: player.goals || 0,
          assists: player.assists || 0,
          yellow_cards: player.yellow_cards || 0,
          red_cards: player.red_cards || 0,
          total_minutes_played: player.total_minutes_played || 0,
          matches_played: player.matches_played || 0
        };
      });

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Error fetching top assists:', error);
      throw error;
    }
  },

  async getByTeam(teamId: string): Promise<PlayerStatsData[]> {
    console.log('👥 PlayerStatsAPI: Fetching team player stats for team:', teamId);
    
    try {
      // Get team info first
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, __id__, name')
        .or(`id.eq.${teamId},__id__.eq.${teamId}`)
        .single();

      if (teamError || !team) {
        console.warn('⚠️ PlayerStatsAPI: Team not found:', teamId);
        return [];
      }

      // Get members for this team
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('team_id', team.__id__);

      if (membersError) {
        throw membersError;
      }

      console.log('✅ PlayerStatsAPI: Team player stats fetched:', {
        teamName: team.name,
        playersCount: members?.length || 0
      });

      return (members || []).map(player => ({
        id: player.id,
        name: player.name || 'Unknown Player',
        team_name: team.name,
        goals: player.goals || 0,
        assists: player.assists || 0,
        yellow_cards: player.yellow_cards || 0,
        red_cards: player.red_cards || 0,
        total_minutes_played: player.total_minutes_played || 0,
        matches_played: player.matches_played || 0
      }));

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Error fetching team player stats:', error);
      throw error;
    }
  }
};
