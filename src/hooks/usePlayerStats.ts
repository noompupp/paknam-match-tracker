
import { useQuery } from '@tanstack/react-query';
import { playerStatsApi } from '@/services/playerStatsApi';

export const usePlayerStats = () => {
  return useQuery({
    queryKey: ['playerStats'],
    queryFn: () => playerStatsApi.getAll(),
    staleTime: 5 * 1000, // Reduced to 5 seconds for more responsive updates
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for cumulative stats
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
    staleTime: 5 * 1000, // Reduced for responsive leaderboard updates
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // More frequent refresh for cumulative stats
  });
};

export const useTopAssists = (limit: number = 10) => {
  return useQuery({
    queryKey: ['playerStats', 'topAssists', limit],
    queryFn: () => playerStatsApi.getTopAssists(limit),
    staleTime: 5 * 1000, // Reduced for responsive leaderboard updates
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // More frequent refresh for cumulative stats
  });
};
