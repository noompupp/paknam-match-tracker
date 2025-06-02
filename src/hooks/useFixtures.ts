
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fixturesApi } from '@/services/api';

export const useFixtures = () => {
  return useQuery({
    queryKey: ['fixtures'],
    queryFn: fixturesApi.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpcomingFixtures = () => {
  return useQuery({
    queryKey: ['fixtures', 'upcoming'],
    queryFn: fixturesApi.getUpcoming,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRecentFixtures = () => {
  return useQuery({
    queryKey: ['fixtures', 'recent'],
    queryFn: fixturesApi.getRecent,
    staleTime: 2 * 60 * 1000, // 2 minutes
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
