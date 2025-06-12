
import { useQuery } from '@tanstack/react-query';
import { enhancedTeamStatsService } from '@/services/enhancedTeamStatsService';
import type { EnhancedTeamOverview } from '@/services/enhancedTeamStatsService';

export const useTeamStatisticsAggregation = (teamId: string) => {
  return useQuery({
    queryKey: ['team-statistics-aggregation', teamId],
    queryFn: () => enhancedTeamStatsService.getEnhancedTeamOverview(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
  });
};

export const useTeamPerformanceInsights = (teamId: string) => {
  const { data, isLoading, error } = useTeamStatisticsAggregation(teamId);

  const insights = data ? {
    hasData: true,
    statistics: data.aggregatedStatistics,
    topPerformers: data.topPerformers,
    breakdown: data.performanceBreakdown,
    teamInsights: data.teamInsights,
    keyMetrics: {
      goalScoringRate: data.aggregatedStatistics.goalsPerMatch,
      disciplinaryRecord: data.aggregatedStatistics.disciplinaryRate,
      squadUtilization: data.aggregatedStatistics.activePlayers / data.aggregatedStatistics.totalPlayers,
      teamChemistry: data.teamInsights.team_chemistry_score
    }
  } : {
    hasData: false,
    statistics: null,
    topPerformers: null,
    breakdown: null,
    teamInsights: null,
    keyMetrics: null
  };

  return {
    insights,
    isLoading,
    error,
    refetch: () => {} // Placeholder for refetch function
  };
};

export type TeamPerformanceInsights = ReturnType<typeof useTeamPerformanceInsights>['insights'];
