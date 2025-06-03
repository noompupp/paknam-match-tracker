
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fixturesApi } from '@/services/api';

export const useFixtures = () => {
  return useQuery({
    queryKey: ['fixtures'],
    queryFn: async () => {
      console.log('🎣 useFixtures: Starting query...');
      try {
        const fixtures = await fixturesApi.getAll();
        console.log('🎣 useFixtures: Query successful, fixtures:', fixtures);
        return fixtures;
      } catch (error) {
        console.error('🎣 useFixtures: Query failed:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      console.log('🎣 useFixtures: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useUpcomingFixtures = () => {
  return useQuery({
    queryKey: ['fixtures', 'upcoming'],
    queryFn: async () => {
      console.log('🎣 useUpcomingFixtures: Starting query...');
      try {
        const fixtures = await fixturesApi.getUpcoming();
        console.log('🎣 useUpcomingFixtures: Query successful, fixtures:', fixtures);
        return fixtures;
      } catch (error) {
        console.error('🎣 useUpcomingFixtures: Query failed:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      console.log('🎣 useUpcomingFixtures: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useRecentFixtures = () => {
  return useQuery({
    queryKey: ['fixtures', 'recent'],
    queryFn: async () => {
      console.log('🎣 useRecentFixtures: Starting query...');
      try {
        const fixtures = await fixturesApi.getRecent();
        console.log('🎣 useRecentFixtures: Query successful, fixtures:', fixtures);
        return fixtures;
      } catch (error) {
        console.error('🎣 useRecentFixtures: Query failed:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      console.log('🎣 useRecentFixtures: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useUpdateFixtureScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, homeScore, awayScore }: { id: number; homeScore: number; awayScore: number }) =>
      fixturesApi.updateScore(id, homeScore, awayScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};
