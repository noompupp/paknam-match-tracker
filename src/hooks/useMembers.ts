
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '@/services/api';

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      console.log('🎣 useMembers: Starting query...');
      try {
        const members = await membersApi.getAll();
        console.log('🎣 useMembers: Query successful, members:', members);
        return members;
      } catch (error) {
        console.error('🎣 useMembers: Query failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log('🎣 useMembers: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useTeamMembers = (teamId: number) => {
  return useQuery({
    queryKey: ['members', 'team', teamId],
    queryFn: async () => {
      console.log('🎣 useTeamMembers: Starting query for team ID:', teamId);
      try {
        const members = await membersApi.getByTeam(teamId);
        console.log('🎣 useTeamMembers: Query successful, members:', members);
        return members;
      } catch (error) {
        console.error('🎣 useTeamMembers: Query failed:', error);
        throw error;
      }
    },
    enabled: !!teamId,
  });
};

export const useUpdateMemberStats = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stats }: { id: number; stats: { goals?: number; assists?: number } }) =>
      membersApi.updateStats(id, stats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useTopScorers = () => {
  const { data: members, isLoading, error } = useMembers();
  
  console.log('🎣 useTopScorers: Raw members data:', members);
  
  const topScorers = members
    ?.filter(member => member.goals && member.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5)
    .map(member => ({
      name: member.name,
      team: member.team?.name || 'Unknown Team',
      goals: member.goals,
    })) || [];

  console.log('🎣 useTopScorers: Computed top scorers:', topScorers);

  return {
    data: topScorers,
    isLoading,
    error,
  };
};
