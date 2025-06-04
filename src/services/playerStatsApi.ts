
import { supabase } from '@/integrations/supabase/client';

export interface PlayerStats {
  id: number;
  name: string;
  team_id: string;
  team_name: string;
  position: string;
  number: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  total_minutes_played: number;
  matches_played: number;
}

export const playerStatsApi = {
  async getAll(): Promise<PlayerStats[]> {
    console.log('📊 PlayerStatsAPI: Fetching all player stats...');
    
    const { data, error } = await supabase
      .from('player_stats_view')
      .select('*')
      .order('goals', { ascending: false });

    if (error) {
      console.error('❌ PlayerStatsAPI: Error fetching player stats:', error);
      throw new Error(`Failed to fetch player stats: ${error.message}`);
    }

    console.log('✅ PlayerStatsAPI: Player stats fetched successfully:', data?.length || 0, 'players');
    return data || [];
  },

  async getByTeam(teamId: string): Promise<PlayerStats[]> {
    console.log('📊 PlayerStatsAPI: Fetching player stats for team:', teamId);
    
    const { data, error } = await supabase
      .from('player_stats_view')
      .select('*')
      .eq('team_id', teamId)
      .order('goals', { ascending: false });

    if (error) {
      console.error('❌ PlayerStatsAPI: Error fetching team player stats:', error);
      throw new Error(`Failed to fetch team player stats: ${error.message}`);
    }

    return data || [];
  },

  async getTopScorers(limit: number = 10): Promise<PlayerStats[]> {
    console.log('🏆 PlayerStatsAPI: Fetching top scorers, limit:', limit);
    
    const { data, error } = await supabase
      .from('player_stats_view')
      .select('*')
      .gt('goals', 0)
      .order('goals', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ PlayerStatsAPI: Error fetching top scorers:', error);
      throw new Error(`Failed to fetch top scorers: ${error.message}`);
    }

    return data || [];
  },

  async getTopAssists(limit: number = 10): Promise<PlayerStats[]> {
    console.log('🎯 PlayerStatsAPI: Fetching top assists, limit:', limit);
    
    const { data, error } = await supabase
      .from('player_stats_view')
      .select('*')
      .gt('assists', 0)
      .order('assists', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ PlayerStatsAPI: Error fetching top assists:', error);
      throw new Error(`Failed to fetch top assists: ${error.message}`);
    }

    return data || [];
  }
};
