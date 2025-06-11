
import { useQuery } from '@tanstack/react-query';
import { playerStatsApi } from '@/services/playerStatsApi';

export const usePlayerStats = () => {
  return useQuery({
    queryKey: ['playerStats'],
    queryFn: () => playerStatsApi.getAll(),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute to ensure fresh data
  });
};

export const useTeamPlayerStats = (teamId: string) => {
  return useQuery({
    queryKey: ['playerStats', 'team', teamId],
    queryFn: () => playerStatsApi.getByTeam(teamId),
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useTopScorers = (limit: number = 10) => {
  return useQuery({
    queryKey: ['playerStats', 'topScorers', limit],
    queryFn: () => playerStatsApi.getTopScorers(limit),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useTopAssists = (limit: number = 10) => {
  return useQuery({
    queryKey: ['playerStats', 'topAssists', limit],
    queryFn: () => playerStatsApi.getTopAssists(limit),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

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
        id: player.id,
        name: player.name,
        team_name: player.team_name,
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
        id: player.id,
        name: player.name,
        team_name: player.team_name,
        assists: player.assists
      })) || [];
    }
  });
};
