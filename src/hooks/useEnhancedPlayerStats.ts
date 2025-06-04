
import { useQuery } from '@tanstack/react-query';
import { playerStatsApi } from '@/services/playerStatsApi';

export const useEnhancedTopScorers = (limit: number = 10) => {
  return useQuery({
    queryKey: ['enhancedPlayerStats', 'topScorers', limit],
    queryFn: () => {
      console.log('🎣 useEnhancedTopScorers: Starting enhanced query with limit:', limit);
      return playerStatsApi.getTopScorers(limit);
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
    select: (data) => {
      console.log('✅ useEnhancedTopScorers: Query successful, scorers:', data?.length || 0);
      return data?.map(player => ({
        name: player.name,
        team: player.team_name,
        goals: player.goals
      })) || [];
    }
  });
};

export const useEnhancedTopAssists = (limit: number = 10) => {
  return useQuery({
    queryKey: ['enhancedPlayerStats', 'topAssists', limit],
    queryFn: () => {
      console.log('🎣 useEnhancedTopAssists: Starting enhanced query with limit:', limit);
      return playerStatsApi.getTopAssists(limit);
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
    select: (data) => {
      console.log('✅ useEnhancedTopAssists: Query successful, assists:', data?.length || 0);
      return data?.map(player => ({
        name: player.name,
        team: player.team_name,
        assists: player.assists
      })) || [];
    }
  });
};

export const useEnhancedTeamPlayerStats = (teamId: string) => {
  return useQuery({
    queryKey: ['enhancedPlayerStats', 'team', teamId],
    queryFn: () => {
      console.log('🎣 useEnhancedTeamPlayerStats: Fetching team stats for:', teamId);
      return playerStatsApi.getByTeam(teamId);
    },
    enabled: !!teamId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
    select: (data) => {
      console.log('📊 useEnhancedTeamPlayerStats: Processing team player data:', data?.length || 0);
      
      return data?.map(player => {
        // Enhanced role mapping logic based on position field
        let role: string | undefined = undefined;
        
        if (player.position) {
          const position = player.position.toLowerCase();
          if (position === 'captain') {
            role = 'Captain';
          } else if (position === 's-class') {
            role = 'S-class';
          } else if (position === 'starter') {
            role = 'Starter';
          }
          // If position doesn't match known roles, role remains undefined
        }

        console.log(`🏷️ useEnhancedTeamPlayerStats: Player ${player.name} - Position: ${player.position}, Role: ${role}`);

        return {
          id: player.id,
          name: player.name,
          position: player.position || 'Player',
          number: player.number || '',
          goals: player.goals || 0,
          assists: player.assists || 0,
          totalMinutesPlayed: player.total_minutes_played || 0,
          matchesPlayed: player.matches_played || 0,
          yellowCards: player.yellow_cards || 0,
          redCards: player.red_cards || 0,
          role: role // This will be Captain, S-class, Starter, or undefined
        };
      }) || [];
    }
  });
};
