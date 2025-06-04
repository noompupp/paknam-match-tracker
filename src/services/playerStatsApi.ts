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

// Fallback query function for when relationships fail
async function fallbackPlayerQuery(): Promise<PlayerStatsData[]> {
  console.log('🔄 PlayerStatsAPI: Using fallback query strategy...');
  
  try {
    // Get members without relationship
    const { data: members, error: membersError } = await supabase
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
        team_id
      `)
      .order('name', { ascending: true });

    if (membersError) {
      console.error('❌ PlayerStatsAPI: Fallback members query failed:', membersError);
      throw membersError;
    }

    // Get teams separately
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, __id__, name');

    if (teamsError) {
      console.error('❌ PlayerStatsAPI: Fallback teams query failed:', teamsError);
      throw teamsError;
    }

    // Manual join
    const transformedData = (members || []).map(member => {
      const team = teams?.find(t => t.__id__ === member.team_id || t.id.toString() === member.team_id);
      
      return {
        id: member.id,
        name: member.name || 'Unknown Player',
        team_name: team?.name || 'Unknown Team',
        team_id: member.team_id || '',
        goals: member.goals || 0,
        assists: member.assists || 0,
        position: member.position || 'Player',
        number: member.number || '',
        yellow_cards: member.yellow_cards || 0,
        red_cards: member.red_cards || 0,
        total_minutes_played: member.total_minutes_played || 0,
        matches_played: member.matches_played || 0
      };
    });

    console.log('✅ PlayerStatsAPI: Fallback query successful:', transformedData.length);
    return transformedData;

  } catch (error) {
    console.error('❌ PlayerStatsAPI: Fallback query completely failed:', error);
    throw error;
  }
}

export const playerStatsApi = {
  async getAll(): Promise<PlayerStatsData[]> {
    console.log('🏆 PlayerStatsAPI: Fetching all players with enhanced error handling...');
    
    try {
      // Primary query with explicit relationship syntax
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
          teams!inner(
            id,
            __id__,
            name
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        console.warn('⚠️ PlayerStatsAPI: Primary query failed, trying fallback:', error.message);
        
        await operationLoggingService.logOperation({
          operation_type: 'player_stats_fetch_primary_failed',
          table_name: 'members',
          error_message: error.message,
          success: false
        });

        // Use fallback strategy
        return await fallbackPlayerQuery();
      }

      // Transform successful primary query data
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
        result: { count: transformedData.length, method: 'primary' },
        success: true
      });

      console.log('✅ PlayerStatsAPI: Primary query successful:', transformedData.length);
      return transformedData;

    } catch (error) {
      console.error('❌ PlayerStatsAPI: All query strategies failed:', error);
      
      await operationLoggingService.logOperation({
        operation_type: 'player_stats_fetch_all_failed',
        table_name: 'members',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });

      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  async getTopScorers(limit: number = 10): Promise<PlayerStatsData[]> {
    console.log('🏆 PlayerStatsAPI: Fetching top scorers with fallback strategy...');
    
    try {
      // Try primary query first
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
        .gte('goals', 0)
        .order('goals', { ascending: false })
        .order('assists', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) {
        console.warn('⚠️ PlayerStatsAPI: Top scorers primary query failed, using fallback');
        
        // Fallback: get all players and filter/sort manually
        const allPlayers = await fallbackPlayerQuery();
        return allPlayers
          .filter(player => player.goals >= 0)
          .sort((a, b) => {
            if (b.goals !== a.goals) return b.goals - a.goals;
            if (b.assists !== a.assists) return b.assists - a.assists;
            return a.name.localeCompare(b.name);
          })
          .slice(0, limit);
      }

      // Transform successful data
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

      console.log('✅ PlayerStatsAPI: Top scorers fetched successfully:', transformedData.length);
      return transformedData;

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Top scorers query failed completely:', error);
      return [];
    }
  },

  async getTopAssists(limit: number = 10): Promise<PlayerStatsData[]> {
    console.log('🎯 PlayerStatsAPI: Fetching top assists with fallback strategy...');
    
    try {
      // Try primary query first
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
        .gte('assists', 0)
        .order('assists', { ascending: false })
        .order('goals', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) {
        console.warn('⚠️ PlayerStatsAPI: Top assists primary query failed, using fallback');
        
        // Fallback: get all players and filter/sort manually
        const allPlayers = await fallbackPlayerQuery();
        return allPlayers
          .filter(player => player.assists >= 0)
          .sort((a, b) => {
            if (b.assists !== a.assists) return b.assists - a.assists;
            if (b.goals !== a.goals) return b.goals - a.goals;
            return a.name.localeCompare(b.name);
          })
          .slice(0, limit);
      }

      // Transform successful data
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

      console.log('✅ PlayerStatsAPI: Top assists fetched successfully:', transformedData.length);
      return transformedData;

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Top assists query failed completely:', error);
      return [];
    }
  },

  async getByTeam(teamId: string): Promise<PlayerStatsData[]> {
    console.log('👥 PlayerStatsAPI: Fetching team players with enhanced error handling, teamId:', teamId);
    
    try {
      // Try primary query first
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
        console.warn('⚠️ PlayerStatsAPI: Team players primary query failed, using fallback');
        
        // Fallback: get all players and filter manually
        const allPlayers = await fallbackPlayerQuery();
        return allPlayers.filter(player => player.team_id === teamId);
      }

      // Transform successful data
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

      console.log('✅ PlayerStatsAPI: Team players fetched successfully:', transformedData.length);
      return transformedData;

    } catch (error) {
      console.error('❌ PlayerStatsAPI: Team players query failed completely:', error);
      return [];
    }
  },

  async refreshPlayerStats(): Promise<{ success: boolean; message: string }> {
    console.log('🔄 PlayerStatsAPI: Refreshing all player stats with enhanced validation...');
    
    try {
      // Test both primary and fallback queries
      const primaryResult = await this.getAll();
      const fallbackResult = await fallbackPlayerQuery();
      
      await operationLoggingService.logOperation({
        operation_type: 'player_stats_refresh',
        table_name: 'members',
        result: { 
          primary_count: primaryResult.length,
          fallback_count: fallbackResult.length,
          data_consistency: primaryResult.length === fallbackResult.length
        },
        success: true
      });

      console.log(`✅ PlayerStatsAPI: Stats refresh completed. Primary: ${primaryResult.length}, Fallback: ${fallbackResult.length}`);
      
      return {
        success: true,
        message: `Successfully refreshed stats. Primary query: ${primaryResult.length} players, Fallback query: ${fallbackResult.length} players.`
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
