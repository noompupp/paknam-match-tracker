
import { useQueryClient } from '@tanstack/react-query';

export const useCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateMatchQueries = async (fixtureId: any) => {
    await queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    await queryClient.invalidateQueries({ queryKey: ['match_events'] });
    await queryClient.invalidateQueries({ queryKey: ['enhancedMatchSummary', fixtureId] });
    await queryClient.invalidateQueries({ queryKey: ['enhancedMatchSummaryWithTeams', fixtureId] });
    await queryClient.removeQueries({ queryKey: ['enhancedMatchSummary', fixtureId] });
  };

  return { invalidateMatchQueries };
};
