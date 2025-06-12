
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from './operationLoggingService';

export interface EnhancedPlayerStats {
  id: number;
  name: string;
  nickname?: string;
  number: string;
  position: string;
  role: string;
  ProfileURL?: string;
  
  // Performance stats
  goals: number;
  assists: number;
  matches_played: number;
  total_minutes_played: number;
  
  // Discipline stats
  yellow_cards: number;
  red_cards: number;
  
  // Calculated metrics
  goalsPerMatch: number;
  assistsPerMatch: number;
  minutesPerMatch: number;
  contributionScore: number;
  
  // Team context
  team: {
    id: string;
    name: string;
    color?: string;
    logo?: string;
  };
}

export interface TeamStatsOverview {
  totalPlayers: number;
  totalGoals: number;
  totalAssists: number;
  totalMinutes: number;
  totalMatches: number;
  averageGoalsPerMatch: number;
  averageMinutesPerPlayer: number;
  topScorer: EnhancedPlayerStats | null;
  topAssister: EnhancedPlayerStats | null;
  mostExperienced: EnhancedPlayerStats | null;
}

export const enhancedTeamStatsService = {
  async getTeamPlayerStats(teamId: string): Promise<EnhancedPlayerStats[]> {
    console.log('🎯 EnhancedTeamStatsService: Fetching enhanced stats for team:', teamId);
    
    try {
      // Get team information first
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, __id__, name, color, logo')
        .or(`id.eq.${teamId},__id__.eq.${teamId}`)
        .single();

      if (teamError || !team) {
        console.error('❌ Team not found:', teamError);
        throw new Error(`Team not found: ${teamId}`);
      }

      // Get members with enhanced data
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select(`
          id,
          name,
          nickname,
          number,
          position,
          role,
          ProfileURL,
          goals,
          assists,
          matches_played,
          total_minutes_played,
          yellow_cards,
          red_cards
        `)
        .eq('team_id', team.__id__)
        .order('name', { ascending: true });

      if (membersError) {
        console.error('❌ Error fetching members:', membersError);
        throw membersError;
      }

      // Transform and enhance the data
      const enhancedStats: EnhancedPlayerStats[] = (members || []).map(member => {
        const goals = member.goals || 0;
        const assists = member.assists || 0;
        const matches = member.matches_played || 0;
        const minutes = member.total_minutes_played || 0;

        return {
          id: member.id,
          name: member.name || 'Unknown Player',
          nickname: member.nickname,
          number: member.number || '',
          position: member.position || 'Player',
          role: member.role || 'Starter',
          ProfileURL: member.ProfileURL,
          
          goals,
          assists,
          matches_played: matches,
          total_minutes_played: minutes,
          yellow_cards: member.yellow_cards || 0,
          red_cards: member.red_cards || 0,
          
          // Calculated metrics
          goalsPerMatch: matches > 0 ? Number((goals / matches).toFixed(2)) : 0,
          assistsPerMatch: matches > 0 ? Number((assists / matches).toFixed(2)) : 0,
          minutesPerMatch: matches > 0 ? Math.round(minutes / matches) : 0,
          contributionScore: goals * 3 + assists * 2 + Math.floor(minutes / 90),
          
          team: {
            id: team.__id__,
            name: team.name,
            color: team.color,
            logo: team.logo
          }
        };
      });

      await operationLoggingService.logOperation({
        operation_type: 'enhanced_team_stats_fetch',
        table_name: 'members',
        result: { 
          team_id: teamId,
          players_count: enhancedStats.length,
          total_goals: enhancedStats.reduce((sum, p) => sum + p.goals, 0)
        },
        success: true
      });

      console.log('✅ Enhanced team stats fetched successfully:', {
        teamName: team.name,
        playersCount: enhancedStats.length,
        totalGoals: enhancedStats.reduce((sum, p) => sum + p.goals, 0)
      });

      return enhancedStats;

    } catch (error) {
      console.error('❌ Error in enhanced team stats service:', error);
      
      await operationLoggingService.logOperation({
        operation_type: 'enhanced_team_stats_fetch_failed',
        table_name: 'members',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });

      throw error;
    }
  },

  async getTeamOverview(teamId: string): Promise<TeamStatsOverview> {
    console.log('📊 Getting team overview for:', teamId);
    
    const players = await this.getTeamPlayerStats(teamId);
    
    const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
    const totalAssists = players.reduce((sum, p) => sum + p.assists, 0);
    const totalMinutes = players.reduce((sum, p) => sum + p.total_minutes_played, 0);
    const totalMatches = Math.max(...players.map(p => p.matches_played), 0);
    
    const topScorer = players.reduce((top, player) => 
      player.goals > (top?.goals || 0) ? player : top, null as EnhancedPlayerStats | null);
    
    const topAssister = players.reduce((top, player) => 
      player.assists > (top?.assists || 0) ? player : top, null as EnhancedPlayerStats | null);
    
    const mostExperienced = players.reduce((top, player) => 
      player.total_minutes_played > (top?.total_minutes_played || 0) ? player : top, null as EnhancedPlayerStats | null);

    return {
      totalPlayers: players.length,
      totalGoals,
      totalAssists,
      totalMinutes,
      totalMatches,
      averageGoalsPerMatch: totalMatches > 0 ? Number((totalGoals / totalMatches).toFixed(2)) : 0,
      averageMinutesPerPlayer: players.length > 0 ? Math.round(totalMinutes / players.length) : 0,
      topScorer,
      topAssister,
      mostExperienced
    };
  },

  formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  },

  formatStatDisplay(value: number, suffix: string = ''): string {
    if (value === 0) return '0';
    return `${value}${suffix}`;
  },

  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'captain': 'Captain',
      's-class': 'S-Class',
      'starter': 'Starter',
      'substitute': 'Sub'
    };
    return roleMap[role?.toLowerCase()] || role || 'Player';
  },

  getPositionDisplayName(position: string): string {
    const positionMap: Record<string, string> = {
      'goalkeeper': 'GK',
      'defender': 'DEF',
      'midfielder': 'MID',
      'forward': 'FWD'
    };
    return positionMap[position?.toLowerCase()] || position || 'Player';
  }
};
