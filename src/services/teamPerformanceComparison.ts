
import type { EnhancedPlayerStats } from './enhancedTeamStatsService';
import type { TeamStatistics, TopPerformers } from './teamStatisticsAggregationService';

export interface PerformanceComparison {
  current: TeamStatistics;
  previous?: TeamStatistics;
  trends: {
    goals: 'improving' | 'declining' | 'stable';
    discipline: 'improving' | 'declining' | 'stable';
    efficiency: 'improving' | 'declining' | 'stable';
    activity: 'improving' | 'declining' | 'stable';
  };
  percentageChanges: {
    goalsPerMatch: number;
    disciplinaryRate: number;
    playerEfficiency: number;
    activePlayers: number;
  };
}

export interface PlayerComparison {
  playerId: number;
  name: string;
  currentStats: {
    goals: number;
    assists: number;
    contributionScore: number;
  };
  previousStats?: {
    goals: number;
    assists: number;
    contributionScore: number;
  };
  improvement: {
    goals: number;
    assists: number;
    contributionScore: number;
  };
  trend: 'improving' | 'declining' | 'stable';
}

export interface TeamBenchmarking {
  teamId: string;
  teamName: string;
  rank: number;
  percentile: number;
  comparisonMetrics: {
    goalsPerMatch: { value: number; rank: number; percentile: number };
    disciplinaryRate: { value: number; rank: number; percentile: number };
    playerEfficiency: { value: number; rank: number; percentile: number };
    teamChemistry: { value: number; rank: number; percentile: number };
  };
}

export class TeamPerformanceComparisonService {
  
  /**
   * Compare current team performance with historical data
   */
  static comparePerformance(
    currentStats: TeamStatistics,
    previousStats?: TeamStatistics
  ): PerformanceComparison {
    const trends = this.calculateTrends(currentStats, previousStats);
    const percentageChanges = this.calculatePercentageChanges(currentStats, previousStats);
    
    return {
      current: currentStats,
      previous: previousStats,
      trends,
      percentageChanges
    };
  }

  /**
   * Compare individual player performance over time
   */
  static comparePlayerPerformance(
    currentPlayers: EnhancedPlayerStats[],
    previousPlayers?: EnhancedPlayerStats[]
  ): PlayerComparison[] {
    return currentPlayers.map(currentPlayer => {
      const previousPlayer = previousPlayers?.find(p => p.id === currentPlayer.id);
      
      const improvement = {
        goals: currentPlayer.goals - (previousPlayer?.goals || 0),
        assists: currentPlayer.assists - (previousPlayer?.assists || 0),
        contributionScore: currentPlayer.contributionScore - (previousPlayer?.contributionScore || 0)
      };

      const trend = this.determinePlayerTrend(improvement);

      return {
        playerId: currentPlayer.id,
        name: currentPlayer.name,
        currentStats: {
          goals: currentPlayer.goals,
          assists: currentPlayer.assists,
          contributionScore: currentPlayer.contributionScore
        },
        previousStats: previousPlayer ? {
          goals: previousPlayer.goals,
          assists: previousPlayer.assists,
          contributionScore: previousPlayer.contributionScore
        } : undefined,
        improvement,
        trend
      };
    });
  }

  /**
   * Benchmark team against league averages
   */
  static benchmarkTeam(
    teamStats: TeamStatistics,
    leagueTeamsStats: TeamStatistics[],
    teamId: string,
    teamName: string
  ): TeamBenchmarking {
    const sortedByGoals = [...leagueTeamsStats].sort((a, b) => b.goalsPerMatch - a.goalsPerMatch);
    const sortedByDiscipline = [...leagueTeamsStats].sort((a, b) => a.disciplinaryRate - b.disciplinaryRate);
    const sortedByEfficiency = [...leagueTeamsStats].sort((a, b) => b.playerEfficiency - a.playerEfficiency);
    
    // Note: team_chemistry_score would need to be calculated for all teams for this to work
    const sortedByChemistry = [...leagueTeamsStats].sort((a, b) => 
      (b as any).team_chemistry_score - (a as any).team_chemistry_score
    );

    const totalTeams = leagueTeamsStats.length;
    
    const goalsRank = sortedByGoals.findIndex(stats => 
      Math.abs(stats.goalsPerMatch - teamStats.goalsPerMatch) < 0.01) + 1;
    const disciplineRank = sortedByDiscipline.findIndex(stats => 
      Math.abs(stats.disciplinaryRate - teamStats.disciplinaryRate) < 0.01) + 1;
    const efficiencyRank = sortedByEfficiency.findIndex(stats => 
      Math.abs(stats.playerEfficiency - teamStats.playerEfficiency) < 0.01) + 1;
    const chemistryRank = 1; // Placeholder since we'd need team_chemistry_score for all teams

    return {
      teamId,
      teamName,
      rank: Math.round((goalsRank + disciplineRank + efficiencyRank) / 3),
      percentile: Math.round((1 - (goalsRank / totalTeams)) * 100),
      comparisonMetrics: {
        goalsPerMatch: {
          value: teamStats.goalsPerMatch,
          rank: goalsRank,
          percentile: Math.round((1 - (goalsRank / totalTeams)) * 100)
        },
        disciplinaryRate: {
          value: teamStats.disciplinaryRate,
          rank: disciplineRank,
          percentile: Math.round((1 - (disciplineRank / totalTeams)) * 100)
        },
        playerEfficiency: {
          value: teamStats.playerEfficiency,
          rank: efficiencyRank,
          percentile: Math.round((1 - (efficiencyRank / totalTeams)) * 100)
        },
        teamChemistry: {
          value: 0, // Placeholder
          rank: chemistryRank,
          percentile: 50 // Placeholder
        }
      }
    };
  }

  /**
   * Get performance insights and recommendations
   */
  static getPerformanceInsights(comparison: PerformanceComparison): string[] {
    const insights: string[] = [];
    
    if (comparison.trends.goals === 'improving') {
      insights.push(`Goal scoring has improved by ${comparison.percentageChanges.goalsPerMatch.toFixed(1)}%`);
    } else if (comparison.trends.goals === 'declining') {
      insights.push(`Goal scoring has declined by ${Math.abs(comparison.percentageChanges.goalsPerMatch).toFixed(1)}%`);
    }

    if (comparison.trends.discipline === 'improving') {
      insights.push(`Team discipline has improved with ${Math.abs(comparison.percentageChanges.disciplinaryRate).toFixed(1)}% fewer cards`);
    } else if (comparison.trends.discipline === 'declining') {
      insights.push(`Disciplinary issues have increased by ${comparison.percentageChanges.disciplinaryRate.toFixed(1)}%`);
    }

    if (comparison.trends.efficiency === 'improving') {
      insights.push(`Player efficiency has improved by ${comparison.percentageChanges.playerEfficiency.toFixed(1)}%`);
    }

    if (comparison.trends.activity === 'improving') {
      insights.push(`Squad activity has increased with ${comparison.percentageChanges.activePlayers.toFixed(1)}% more active players`);
    }

    return insights;
  }

  // Private helper methods
  private static calculateTrends(current: TeamStatistics, previous?: TeamStatistics) {
    if (!previous) {
      return {
        goals: 'stable' as const,
        discipline: 'stable' as const,
        efficiency: 'stable' as const,
        activity: 'stable' as const
      };
    }

    const goalsTrend = this.determineTrend(current.goalsPerMatch, previous.goalsPerMatch);
    const disciplineTrend = this.determineTrend(previous.disciplinaryRate, current.disciplinaryRate); // Reversed for discipline
    const efficiencyTrend = this.determineTrend(current.playerEfficiency, previous.playerEfficiency);
    const activityTrend = this.determineTrend(current.activePlayers, previous.activePlayers);

    return {
      goals: goalsTrend,
      discipline: disciplineTrend,
      efficiency: efficiencyTrend,
      activity: activityTrend
    };
  }

  private static calculatePercentageChanges(current: TeamStatistics, previous?: TeamStatistics) {
    if (!previous) {
      return {
        goalsPerMatch: 0,
        disciplinaryRate: 0,
        playerEfficiency: 0,
        activePlayers: 0
      };
    }

    return {
      goalsPerMatch: this.calculatePercentageChange(previous.goalsPerMatch, current.goalsPerMatch),
      disciplinaryRate: this.calculatePercentageChange(previous.disciplinaryRate, current.disciplinaryRate),
      playerEfficiency: this.calculatePercentageChange(previous.playerEfficiency, current.playerEfficiency),
      activePlayers: this.calculatePercentageChange(previous.activePlayers, current.activePlayers)
    };
  }

  private static determineTrend(current: number, previous: number): 'improving' | 'declining' | 'stable' {
    const change = ((current - previous) / Math.max(previous, 1)) * 100;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  private static determinePlayerTrend(improvement: { goals: number; assists: number; contributionScore: number }): 'improving' | 'declining' | 'stable' {
    const totalImprovement = improvement.goals + improvement.assists + improvement.contributionScore;
    
    if (totalImprovement > 2) return 'improving';
    if (totalImprovement < -2) return 'declining';
    return 'stable';
  }

  private static calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}

export const teamPerformanceComparison = TeamPerformanceComparisonService;
