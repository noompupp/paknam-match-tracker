
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '@/services/api';
import { Team } from '@/types/database';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: teamsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTeam = (id: number) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamsApi.getById(id),
    enabled: !!id,
  });
};

export const useUpdateTeamStats = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stats }: { id: number; stats: Partial<Team> }) =>
      teamsApi.updateStats(id, stats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};
