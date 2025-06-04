
import { useQuery } from '@tanstack/react-query';
import { enhancedMatchSummaryService } from '@/services/fixtures/enhancedMatchSummaryService';

export const useEnhancedMatchData = (fixtureId?: number) => {
  return useQuery({
    queryKey: ['enhancedMatchData', fixtureId],
    queryFn: async () => {
      if (!fixtureId) return null;
      console.log('🎣 useEnhancedMatchData: Fetching enhanced data for fixture:', fixtureId);
      return await enhancedMatchSummaryService.getEnhancedMatchSummary(fixtureId);
    },
    enabled: !!fixtureId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 2
  });
};
