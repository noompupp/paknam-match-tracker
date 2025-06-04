import { supabase } from '@/integrations/supabase/client';
import { enhancedMemberStatsService } from './enhancedMemberStatsService';
import { operationLoggingService } from './operationLoggingService';

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
      // Query the enhanced members table directly with explicit relationship
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
          validation_status,
          sync_status,
          teams!members_team_id_fkey(name)
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ PlayerStatsAPI: Error fetching all players:', error);
        await operationLoggingService.logOperation({
          operation_type: 'player_stats_fetch_all',
          table_name: 'members',
          error_message: error.message,
          success: false
        });
        throw new Error(`Failed to fetch players: ${error.message}`);
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

      await operationLoggingService.logOperation({
        operation_type: 'player_stats_fetch_all',
        table_name: 'members',
        result: { count: transformedData.length },
        success: true
      });

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
      // Query the enhanced members table directly with explicit relationship
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
          teams!members_team_id_fkey(name)
        `)
        .gte('goals', 0)
        .order('goals', { ascending: false })
        .order('assists', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ PlayerStatsAPI: Error fetching top scorers:', error);
        throw new Error(`Failed to fetch top scorers: ${error.message}`);
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
      // Query the enhanced members table directly with explicit relationship
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
          teams!members_team_id_fkey(name)
        `)
        .gte('assists', 0)
        .order('assists', { ascending: false })
        .order('goals', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ PlayerStatsAPI: Error fetching top assists:', error);
        throw new Error(`Failed to fetch top assists: ${error.message}`);
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
      // Query the enhanced members table directly for team players with explicit relationship
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
          teams!members_team_id_fkey(name)
        `)
        .eq('team_id', teamId)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ PlayerStatsAPI: Error fetching team players:', error);
        throw new Error(`Failed to fetch team players: ${error.message}`);
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
        .select('id, name, goals, assists, yellow_cards, red_cards, total_minutes_played, matches_played, validation_status, sync_status')
        .order('name');

      if (error) {
        await operationLoggingService.logOperation({
          operation_type: 'player_stats_refresh',
          table_name: 'members',
          error_message: error.message,
          success: false
        });
        throw new Error(`Failed to refresh stats: ${error.message}`);
      }

      // Check for any validation issues
      const invalidPlayers = allPlayers?.filter(player => 
        player.validation_status !== 'valid' || player.sync_status !== 'synced'
      ) || [];

      await operationLoggingService.logOperation({
        operation_type: 'player_stats_refresh',
        table_name: 'members',
        result: { 
          total_players: allPlayers?.length || 0,
          invalid_players: invalidPlayers.length 
        },
        success: true
      });

      console.log(`✅ PlayerStatsAPI: Stats refresh completed for ${allPlayers?.length || 0} players from members table`);
      
      return {
        success: true,
        message: `Successfully refreshed stats for ${allPlayers?.length || 0} players from enhanced members table. ${invalidPlayers.length > 0 ? `Found ${invalidPlayers.length} players with validation issues.` : ''}`
      };

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Error refreshing player stats:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during stats refresh'
      };
    }
  },

  async updatePlayerStats(playerId: number, stats: { goals?: number; assists?: number; yellowCards?: number; redCards?: number }): Promise<{ success: boolean; message: string }> {
    console.log('🔄 PlayerStatsAPI: Updating player stats via enhanced service:', { playerId, stats });
    
    const result = await enhancedMemberStatsService.updateMemberStats({
      memberId: playerId,
      goals: stats.goals,
      assists: stats.assists,
      yellowCards: stats.yellowCards,
      redCards: stats.redCards
    });

    return result;
  }
};
