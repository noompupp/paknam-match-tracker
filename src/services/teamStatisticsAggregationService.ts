
import type { EnhancedPlayerStats } from './enhancedTeamStatsService';

export interface TeamStatistics {
  // Basic counts
  totalPlayers: number;
  activePlayers: number;
  benchPlayers: number;
  
  // Performance aggregates
  totalGoals: number;
  totalAssists: number;
  totalMinutes: number;
  totalMatches: number;
  
  // Discipline aggregates
  totalYellowCards: number;
  totalRedCards: number;
  totalCards: number;
  
  // Calculated averages
  averageGoalsPerPlayer: number;
  averageAssistsPerPlayer: number;
  averageMinutesPerPlayer: number;
  averageMatchesPerPlayer: number;
  averageContributionScore: number;
  
  // Team-level metrics
  goalsPerMatch: number;
  assistsPerMatch: number;
  disciplinaryRate: number; // cards per match
  playerEfficiency: number; // total contribution / total minutes
  
  // Distribution insights
  goalDistribution: 'balanced' | 'concentrated' | 'mixed';
  experienceDistribution: 'veteran' | 'young' | 'mixed';
}

export interface TopPerformers {
  topScorer: EnhancedPlayerStats | null;
  topAssister: EnhancedPlayerStats | null;
  mostExperienced: EnhancedPlayerStats | null;
  highestContribution: EnhancedPlayerStats | null;
  mostDisciplined: EnhancedPlayerStats | null; // least cards
}

export interface PerformanceBreakdown {
  byPosition: Record<string, {
    playerCount: number;
    totalGoals: number;
    totalAssists: number;
    averageContribution: number;
  }>;
  byRole: Record<string, {
    playerCount: number;
    totalGoals: number;
    totalAssists: number;
    averageContribution: number;
  }>;
}

export interface TeamInsights {
  strengths: string[];
  areas_for_improvement: string[];
  notable_patterns: string[];
  team_chemistry_score: number; // 0-100
}

export class TeamStatisticsAggregationService {
  
  /**
   * Calculate comprehensive team statistics from enhanced player data
   */
  static calculateTeamStatistics(players: EnhancedPlayerStats[]): TeamStatistics {
    if (!players || players.length === 0) {
      return this.getEmptyStatistics();
    }

    const totalPlayers = players.length;
    const activePlayers = players.filter(p => p.matches_played > 0).length;
    const benchPlayers = totalPlayers - activePlayers;

    // Aggregate performance data
    const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
    const totalAssists = players.reduce((sum, p) => sum + p.assists, 0);
    const totalMinutes = players.reduce((sum, p) => sum + p.total_minutes_played, 0);
    const totalMatches = Math.max(...players.map(p => p.matches_played), 0);

    // Aggregate discipline data
    const totalYellowCards = players.reduce((sum, p) => sum + p.yellow_cards, 0);
    const totalRedCards = players.reduce((sum, p) => sum + p.red_cards, 0);
    const totalCards = totalYellowCards + totalRedCards;

    // Calculate averages
    const averageGoalsPerPlayer = totalPlayers > 0 ? totalGoals / totalPlayers : 0;
    const averageAssistsPerPlayer = totalPlayers > 0 ? totalAssists / totalPlayers : 0;
    const averageMinutesPerPlayer = totalPlayers > 0 ? totalMinutes / totalPlayers : 0;
    const averageMatchesPerPlayer = totalPlayers > 0 ? 
      players.reduce((sum, p) => sum + p.matches_played, 0) / totalPlayers : 0;
    const averageContributionScore = totalPlayers > 0 ? 
      players.reduce((sum, p) => sum + p.contributionScore, 0) / totalPlayers : 0;

    // Calculate team-level metrics
    const goalsPerMatch = totalMatches > 0 ? totalGoals / totalMatches : 0;
    const assistsPerMatch = totalMatches > 0 ? totalAssists / totalMatches : 0;
    const disciplinaryRate = totalMatches > 0 ? totalCards / totalMatches : 0;
    const playerEfficiency = totalMinutes > 0 ? 
      (totalGoals * 3 + totalAssists * 2) / (totalMinutes / 90) : 0;

    // Analyze distributions
    const goalDistribution = this.analyzeGoalDistribution(players);
    const experienceDistribution = this.analyzeExperienceDistribution(players);

    return {
      totalPlayers,
      activePlayers,
      benchPlayers,
      totalGoals,
      totalAssists,
      totalMinutes,
      totalMatches,
      totalYellowCards,
      totalRedCards,
      totalCards,
      averageGoalsPerPlayer: Number(averageGoalsPerPlayer.toFixed(2)),
      averageAssistsPerPlayer: Number(averageAssistsPerPlayer.toFixed(2)),
      averageMinutesPerPlayer: Math.round(averageMinutesPerPlayer),
      averageMatchesPerPlayer: Number(averageMatchesPerPlayer.toFixed(1)),
      averageContributionScore: Number(averageContributionScore.toFixed(1)),
      goalsPerMatch: Number(goalsPerMatch.toFixed(2)),
      assistsPerMatch: Number(assistsPerMatch.toFixed(2)),
      disciplinaryRate: Number(disciplinaryRate.toFixed(2)),
      playerEfficiency: Number(playerEfficiency.toFixed(2)),
      goalDistribution,
      experienceDistribution
    };
  }

  /**
   * Identify top performers across different metrics
   */
  static identifyTopPerformers(players: EnhancedPlayerStats[]): TopPerformers {
    if (!players || players.length === 0) {
      return {
        topScorer: null,
        topAssister: null,
        mostExperienced: null,
        highestContribution: null,
        mostDisciplined: null
      };
    }

    const topScorer = players.reduce((top, player) => 
      player.goals > (top?.goals || 0) ? player : top, null as EnhancedPlayerStats | null);

    const topAssister = players.reduce((top, player) => 
      player.assists > (top?.assists || 0) ? player : top, null as EnhancedPlayerStats | null);

    const mostExperienced = players.reduce((top, player) => 
      player.total_minutes_played > (top?.total_minutes_played || 0) ? player : top, null as EnhancedPlayerStats | null);

    const highestContribution = players.reduce((top, player) => 
      player.contributionScore > (top?.contributionScore || 0) ? player : top, null as EnhancedPlayerStats | null);

    const mostDisciplined = players.reduce((top, player) => {
      const playerCards = player.yellow_cards + player.red_cards;
      const topCards = (top?.yellow_cards || 0) + (top?.red_cards || 0);
      return playerCards < topCards ? player : top;
    }, null as EnhancedPlayerStats | null);

    return {
      topScorer,
      topAssister,
      mostExperienced,
      highestContribution,
      mostDisciplined
    };
  }

  /**
   * Break down performance by position and role
   */
  static analyzePerformanceBreakdown(players: EnhancedPlayerStats[]): PerformanceBreakdown {
    const byPosition: Record<string, any> = {};
    const byRole: Record<string, any> = {};

    // Group by position
    players.forEach(player => {
      const position = player.position || 'Unknown';
      if (!byPosition[position]) {
        byPosition[position] = {
          playerCount: 0,
          totalGoals: 0,
          totalAssists: 0,
          totalContribution: 0
        };
      }
      byPosition[position].playerCount++;
      byPosition[position].totalGoals += player.goals;
      byPosition[position].totalAssists += player.assists;
      byPosition[position].totalContribution += player.contributionScore;
    });

    // Calculate averages for positions
    Object.keys(byPosition).forEach(position => {
      const data = byPosition[position];
      data.averageContribution = data.playerCount > 0 ? 
        Number((data.totalContribution / data.playerCount).toFixed(1)) : 0;
    });

    // Group by role
    players.forEach(player => {
      const role = player.role || 'Unknown';
      if (!byRole[role]) {
        byRole[role] = {
          playerCount: 0,
          totalGoals: 0,
          totalAssists: 0,
          totalContribution: 0
        };
      }
      byRole[role].playerCount++;
      byRole[role].totalGoals += player.goals;
      byRole[role].totalAssists += player.assists;
      byRole[role].totalContribution += player.contributionScore;
    });

    // Calculate averages for roles
    Object.keys(byRole).forEach(role => {
      const data = byRole[role];
      data.averageContribution = data.playerCount > 0 ? 
        Number((data.totalContribution / data.playerCount).toFixed(1)) : 0;
    });

    return { byPosition, byRole };
  }

  /**
   * Generate intelligent insights about team performance
   */
  static generateTeamInsights(
    players: EnhancedPlayerStats[], 
    statistics: TeamStatistics,
    topPerformers: TopPerformers,
    breakdown: PerformanceBreakdown
  ): TeamInsights {
    const strengths: string[] = [];
    const areas_for_improvement: string[] = [];
    const notable_patterns: string[] = [];

    // Analyze strengths
    if (statistics.goalsPerMatch > 2.5) {
      strengths.push("Strong attacking performance");
    }
    if (statistics.disciplinaryRate < 1.0) {
      strengths.push("Excellent discipline record");
    }
    if (statistics.playerEfficiency > 0.8) {
      strengths.push("High player efficiency");
    }

    // Analyze areas for improvement
    if (statistics.goalsPerMatch < 1.0) {
      areas_for_improvement.push("Need to improve goal scoring");
    }
    if (statistics.disciplinaryRate > 3.0) {
      areas_for_improvement.push("Reduce disciplinary issues");
    }
    if (statistics.benchPlayers > statistics.activePlayers) {
      areas_for_improvement.push("Increase squad rotation");
    }

    // Notable patterns
    if (statistics.goalDistribution === 'concentrated') {
      notable_patterns.push("Goals concentrated among few players");
    }
    if (statistics.experienceDistribution === 'veteran') {
      notable_patterns.push("Experienced squad with veteran leadership");
    } else if (statistics.experienceDistribution === 'young') {
      notable_patterns.push("Young squad with potential for growth");
    }

    // Calculate team chemistry score
    const teamChemistryScore = this.calculateTeamChemistry(players, statistics);

    return {
      strengths,
      areas_for_improvement,
      notable_patterns,
      team_chemistry_score: teamChemistryScore
    };
  }

  /**
   * Get comprehensive team analysis combining all metrics
   */
  static getComprehensiveAnalysis(players: EnhancedPlayerStats[]) {
    const statistics = this.calculateTeamStatistics(players);
    const topPerformers = this.identifyTopPerformers(players);
    const breakdown = this.analyzePerformanceBreakdown(players);
    const insights = this.generateTeamInsights(players, statistics, topPerformers, breakdown);

    return {
      statistics,
      topPerformers,
      breakdown,
      insights,
      lastCalculated: new Date().toISOString()
    };
  }

  // Private helper methods
  private static getEmptyStatistics(): TeamStatistics {
    return {
      totalPlayers: 0,
      activePlayers: 0,
      benchPlayers: 0,
      totalGoals: 0,
      totalAssists: 0,
      totalMinutes: 0,
      totalMatches: 0,
      totalYellowCards: 0,
      totalRedCards: 0,
      totalCards: 0,
      averageGoalsPerPlayer: 0,
      averageAssistsPerPlayer: 0,
      averageMinutesPerPlayer: 0,
      averageMatchesPerPlayer: 0,
      averageContributionScore: 0,
      goalsPerMatch: 0,
      assistsPerMatch: 0,
      disciplinaryRate: 0,
      playerEfficiency: 0,
      goalDistribution: 'mixed',
      experienceDistribution: 'mixed'
    };
  }

  private static analyzeGoalDistribution(players: EnhancedPlayerStats[]): 'balanced' | 'concentrated' | 'mixed' {
    const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
    if (totalGoals === 0) return 'mixed';

    const topScorers = players.filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals);
    const topThreeGoals = topScorers.slice(0, 3).reduce((sum, p) => sum + p.goals, 0);
    
    const concentration = topThreeGoals / totalGoals;
    
    if (concentration > 0.7) return 'concentrated';
    if (concentration < 0.4) return 'balanced';
    return 'mixed';
  }

  private static analyzeExperienceDistribution(players: EnhancedPlayerStats[]): 'veteran' | 'young' | 'mixed' {
    const totalMinutes = players.reduce((sum, p) => sum + p.total_minutes_played, 0);
    const averageMinutes = totalMinutes / players.length;
    
    if (averageMinutes > 1000) return 'veteran';
    if (averageMinutes < 400) return 'young';
    return 'mixed';
  }

  private static calculateTeamChemistry(players: EnhancedPlayerStats[], statistics: TeamStatistics): number {
    let score = 50; // Base score
    
    // Factors that improve chemistry
    if (statistics.goalDistribution === 'balanced') score += 15;
    if (statistics.disciplinaryRate < 2.0) score += 10;
    if (statistics.activePlayers / statistics.totalPlayers > 0.7) score += 10;
    if (statistics.playerEfficiency > 0.6) score += 15;
    
    // Factors that reduce chemistry
    if (statistics.disciplinaryRate > 4.0) score -= 20;
    if (statistics.benchPlayers > statistics.activePlayers) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }
}

export const teamStatisticsAggregation = TeamStatisticsAggregationService;
