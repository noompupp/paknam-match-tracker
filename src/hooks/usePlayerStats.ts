
import { useQuery } from '@tanstack/react-query';
import { playerStatsApi } from '@/services/playerStatsApi';

export const usePlayerStats = () => {
  return useQuery({
    queryKey: ['playerStats'],
    queryFn: async () => {
      console.log('🎣 usePlayerStats: Starting query...');
      try {
        const stats = await playerStatsApi.getAll();
        console.log('🎣 usePlayerStats: Query successful, stats:', stats.length, 'players');
        return stats;
      } catch (error) {
        console.error('🎣 usePlayerStats: Query failed:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      console.log('🎣 usePlayerStats: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useTopScorersEnhanced = (limit: number = 5) => {
  return useQuery({
    queryKey: ['topScorers', limit],
    queryFn: async () => {
      console.log('🎣 useTopScorersEnhanced: Starting query with limit:', limit);
      try {
        const scorers = await playerStatsApi.getTopScorers(limit);
        console.log('🎣 useTopScorersEnhanced: Query successful, scorers:', scorers);
        return scorers;
      } catch (error) {
        console.error('🎣 useTopScorersEnhanced: Query failed:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTopAssistsEnhanced = (limit: number = 5) => {
  return useQuery({
    queryKey: ['topAssists', limit],
    queryFn: async () => {
      console.log('🎣 useTopAssistsEnhanced: Starting query with limit:', limit);
      try {
        const assists = await playerStatsApi.getTopAssists(limit);
        console.log('🎣 useTopAssistsEnhanced: Query successful, assists:', assists);
        return assists;
      } catch (error) {
        console.error('🎣 useTopAssistsEnhanced: Query failed:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTeamPlayerStats = (teamId?: string) => {
  return useQuery({
    queryKey: ['teamPlayerStats', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      console.log('🎣 useTeamPlayerStats: Starting query for team:', teamId);
      try {
        const stats = await playerStatsApi.getByTeam(teamId);
        console.log('🎣 useTeamPlayerStats: Query successful, stats:', stats);
        return stats;
      } catch (error) {
        console.error('🎣 useTeamPlayerStats: Query failed:', error);
        throw error;
      }
    },
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
