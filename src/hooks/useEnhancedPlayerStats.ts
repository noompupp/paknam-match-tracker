
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
      console.log('✅ useEnhancedTopScorers: Query successful, scorers:', data);
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
      console.log('✅ useEnhancedTopAssists: Query successful, assists:', data);
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
    queryFn: () => playerStatsApi.getByTeam(teamId),
    enabled: !!teamId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
    select: (data) => {
      return data?.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        number: player.number,
        goals: player.goals,
        assists: player.assists,
        role: player.position === 'Captain' ? 'Captain' : 
              player.position === 'S-class' ? 'S-class' :
              player.position === 'Starter' ? 'Starter' : undefined
      })) || [];
    }
  });
};
