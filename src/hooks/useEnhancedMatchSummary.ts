
import { useQuery } from '@tanstack/react-query';
import { matchSummaryService } from '@/services/fixtures/matchSummaryService';

export const useEnhancedMatchSummary = (fixtureId?: number) => {
  return useQuery({
    queryKey: ['enhancedMatchSummary', fixtureId],
    queryFn: async () => {
      if (!fixtureId) return null;
      console.log('🎣 useEnhancedMatchSummary: Fetching data for fixture:', fixtureId);
      return await matchSummaryService.getMatchSummaryData(fixtureId);
    },
    enabled: !!fixtureId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });
};

export const useUpdateMemberStatsFromMatch = () => {
  return async (fixtureId: number) => {
    console.log('🔄 useUpdateMemberStatsFromMatch: Updating stats for fixture:', fixtureId);
    return await matchSummaryService.updateMemberStatsFromMatch(fixtureId);
  };
};
