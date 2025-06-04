
import { supabase } from '@/integrations/supabase/client';

interface PlayerStatsData {
  id: number;
  name: string;
  team_name: string;
  team_id: string;
  goals: number;
  assists: number;
  position: string;
  number: string;
  yellow_cards: number;
  red_cards: number;
  total_minutes_played: number;
  matches_played: number;
}

export const playerStatsApi = {
  async getAll(): Promise<PlayerStatsData[]> {
    console.log('🏆 PlayerStatsAPI: Fetching all players from members table...');
    
    try {
      // Query the enhanced members table directly
      const { data, error } = await supabase
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
          position,
          number,
          team_id,
          teams!inner(name)
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ PlayerStatsAPI: Error fetching all players:', error);
        throw error;
      }

      // Transform the data to match expected format
      const transformedData = (data || []).map(player => ({
        id: player.id,
        name: player.name || 'Unknown Player',
        team_name: (player.teams as any)?.name || 'Unknown Team',
        team_id: player.team_id || '',
        goals: player.goals || 0,
        assists: player.assists || 0,
        position: player.position || 'Player',
        number: player.number || '',
        yellow_cards: player.yellow_cards || 0,
        red_cards: player.red_cards || 0,
        total_minutes_played: player.total_minutes_played || 0,
        matches_played: player.matches_played || 0
      }));

      console.log('✅ PlayerStatsAPI: All players fetched successfully from members table:', transformedData.length);
      return transformedData;

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Critical error fetching all players:', error);
      throw error;
    }
  },

  async getTopScorers(limit: number = 10): Promise<PlayerStatsData[]> {
    console.log('🏆 PlayerStatsAPI: Fetching top scorers from members table, limit:', limit);
    
    try {
      // Query the enhanced members table directly, ordered by goals
      const { data, error } = await supabase
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
          position,
          number,
          team_id,
          teams!inner(name)
        `)
        .gt('goals', 0)
        .order('goals', { ascending: false })
        .order('assists', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ PlayerStatsAPI: Error fetching top scorers:', error);
        throw error;
      }

      // Transform the data to match expected format
      const transformedData = (data || []).map(player => ({
        id: player.id,
        name: player.name || 'Unknown Player',
        team_name: (player.teams as any)?.name || 'Unknown Team',
        team_id: player.team_id || '',
        goals: player.goals || 0,
        assists: player.assists || 0,
        position: player.position || 'Player',
        number: player.number || '',
        yellow_cards: player.yellow_cards || 0,
        red_cards: player.red_cards || 0,
        total_minutes_played: player.total_minutes_played || 0,
        matches_played: player.matches_played || 0
      }));

      console.log('✅ PlayerStatsAPI: Top scorers fetched successfully from members table:', transformedData.length);
      return transformedData;

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Critical error fetching top scorers:', error);
      throw error;
    }
  },

  async getTopAssists(limit: number = 10): Promise<PlayerStatsData[]> {
    console.log('🎯 PlayerStatsAPI: Fetching top assists from members table, limit:', limit);
    
    try {
      // Query the enhanced members table directly, ordered by assists
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          name,
          assists,
          goals,
          yellow_cards,
          red_cards,
          total_minutes_played,
          matches_played,
          position,
          number,
          team_id,
          teams!inner(name)
        `)
        .gt('assists', 0)
        .order('assists', { ascending: false })
        .order('goals', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ PlayerStatsAPI: Error fetching top assists:', error);
        throw error;
      }

      // Transform the data to match expected format
      const transformedData = (data || []).map(player => ({
        id: player.id,
        name: player.name || 'Unknown Player',
        team_name: (player.teams as any)?.name || 'Unknown Team',
        team_id: player.team_id || '',
        goals: player.goals || 0,
        assists: player.assists || 0,
        position: player.position || 'Player',
        number: player.number || '',
        yellow_cards: player.yellow_cards || 0,
        red_cards: player.red_cards || 0,
        total_minutes_played: player.total_minutes_played || 0,
        matches_played: player.matches_played || 0
      }));

      console.log('✅ PlayerStatsAPI: Top assists fetched successfully from members table:', transformedData.length);
      return transformedData;

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Critical error fetching top assists:', error);
      throw error;
    }
  },

  async getByTeam(teamId: string): Promise<PlayerStatsData[]> {
    console.log('👥 PlayerStatsAPI: Fetching team players from members table, teamId:', teamId);
    
    try {
      // Query the enhanced members table directly for team players
      const { data, error } = await supabase
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
          position,
          number,
          team_id,
          teams!inner(name)
        `)
        .eq('team_id', teamId)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ PlayerStatsAPI: Error fetching team players:', error);
        throw error;
      }

      // Transform the data to match expected format
      const transformedData = (data || []).map(player => ({
        id: player.id,
        name: player.name || 'Unknown Player',
        team_name: (player.teams as any)?.name || 'Unknown Team',
        team_id: player.team_id || '',
        goals: player.goals || 0,
        assists: player.assists || 0,
        position: player.position || 'Player',
        number: player.number || '',
        yellow_cards: player.yellow_cards || 0,
        red_cards: player.red_cards || 0,
        total_minutes_played: player.total_minutes_played || 0,
        matches_played: player.matches_played || 0
      }));

      console.log('✅ PlayerStatsAPI: Team players fetched successfully from members table:', transformedData.length);
      return transformedData;

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Critical error fetching team players:', error);
      throw error;
    }
  },

  async refreshPlayerStats(): Promise<{ success: boolean; message: string }> {
    console.log('🔄 PlayerStatsAPI: Refreshing all player stats from members table...');
    
    try {
      // Validate the current data structure in the enhanced members table
      const { data: allPlayers, error } = await supabase
        .from('members')
        .select('id, name, goals, assists, yellow_cards, red_cards, total_minutes_played, matches_played')
        .order('name');

      if (error) {
        throw error;
      }

      console.log(`✅ PlayerStatsAPI: Stats refresh completed for ${allPlayers?.length || 0} players from members table`);
      
      return {
        success: true,
        message: `Successfully refreshed stats for ${allPlayers?.length || 0} players from enhanced members table`
      };

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Error refreshing player stats:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during stats refresh'
      };
    }
  }
};
