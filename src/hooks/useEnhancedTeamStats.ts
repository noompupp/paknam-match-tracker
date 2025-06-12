
import { useQuery } from '@tanstack/react-query';
import { enhancedTeamStatsService, type EnhancedPlayerStats, type TeamStatsOverview } from '@/services/enhancedTeamStatsService';

export const useEnhancedTeamStats = (teamId: string) => {
  return useQuery({
    queryKey: ['enhancedTeamStats', teamId],
    queryFn: () => enhancedTeamStatsService.getTeamPlayerStats(teamId),
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    select: (data: EnhancedPlayerStats[]) => {
      // Sort players by contribution score and role hierarchy
      const roleOrder = { 'captain': 0, 's-class': 1, 'starter': 2, 'substitute': 3, 'player': 4 };
      
      return data.sort((a, b) => {
        // First by role hierarchy
        const roleA = roleOrder[a.role?.toLowerCase() as keyof typeof roleOrder] ?? 4;
        const roleB = roleOrder[b.role?.toLowerCase() as keyof typeof roleOrder] ?? 4;
        
        if (roleA !== roleB) return roleA - roleB;
        
        // Then by contribution score
        if (b.contributionScore !== a.contributionScore) {
          return b.contributionScore - a.contributionScore;
        }
        
        // Finally by name
        return a.name.localeCompare(b.name);
      });
    }
  });
};

export const useTeamOverview = (teamId: string) => {
  return useQuery({
    queryKey: ['teamOverview', teamId],
    queryFn: () => enhancedTeamStatsService.getTeamOverview(teamId),
    enabled: !!teamId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });
};

export const usePlayerStatsFormatting = () => {
  return {
    formatMinutes: enhancedTeamStatsService.formatMinutes,
    formatStat: enhancedTeamStatsService.formatStatDisplay,
    getRoleDisplay: enhancedTeamStatsService.getRoleDisplayName,
    getPositionDisplay: enhancedTeamStatsService.getPositionDisplayName
  };
};

// Helper hook for filtering and sorting players
export const usePlayerFiltering = (players: EnhancedPlayerStats[]) => {
  const filterByPosition = (position: string) => {
    if (!position || position === 'all') return players;
    return players.filter(player => 
      player.position?.toLowerCase() === position.toLowerCase()
    );
  };

  const filterByRole = (role: string) => {
    if (!role || role === 'all') return players;
    return players.filter(player => 
      player.role?.toLowerCase() === role.toLowerCase()
    );
  };

  const sortByMetric = (metric: keyof EnhancedPlayerStats, ascending = false) => {
    return [...players].sort((a, b) => {
      const valueA = a[metric] as number;
      const valueB = b[metric] as number;
      return ascending ? valueA - valueB : valueB - valueA;
    });
  };

  const getTopPerformers = (metric: keyof EnhancedPlayerStats, limit = 3) => {
    return sortByMetric(metric).slice(0, limit);
  };

  return {
    filterByPosition,
    filterByRole,
    sortByMetric,
    getTopPerformers
  };
};
