
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
