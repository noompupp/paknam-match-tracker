
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '@/services/api';

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTeamMembers = (teamId: number) => {
  return useQuery({
    queryKey: ['members', 'team', teamId],
    queryFn: () => membersApi.getByTeam(teamId),
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
  const { data: members, ...query } = useMembers();
  
  const topScorers = members
    ?.filter(member => member.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5)
    .map(member => ({
      name: member.name,
      team: member.team?.name || 'Unknown Team',
      goals: member.goals,
    })) || [];

  return {
    ...query,
    data: topScorers,
  };
};
