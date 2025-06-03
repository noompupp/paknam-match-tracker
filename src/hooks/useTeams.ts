
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '@/services/api';
import { Team } from '@/types/database';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      console.log('🎣 useTeams: Starting query...');
      try {
        const teams = await teamsApi.getAll();
        console.log('🎣 useTeams: Query successful, teams:', teams);
        return teams;
      } catch (error) {
        console.error('🎣 useTeams: Query failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log('🎣 useTeams: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useTeam = (id: number) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: async () => {
      console.log('🎣 useTeam: Starting query for ID:', id);
      try {
        const team = await teamsApi.getById(id);
        console.log('🎣 useTeam: Query successful, team:', team);
        return team;
      } catch (error) {
        console.error('🎣 useTeam: Query failed:', error);
        throw error;
      }
    },
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
