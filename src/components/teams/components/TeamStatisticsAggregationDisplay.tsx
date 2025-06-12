
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Clock, Zap, Users, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { TeamStatistics, TopPerformers, PerformanceBreakdown, TeamInsights } from "@/services/teamStatisticsAggregationService";

interface TeamStatisticsAggregationDisplayProps {
  statistics: TeamStatistics;
  topPerformers: TopPerformers;
  breakdown: PerformanceBreakdown;
  insights: TeamInsights;
  teamName: string;
}

const TeamStatisticsAggregationDisplay = ({
  statistics,
  topPerformers,
  breakdown,
  insights,
  teamName
}: TeamStatisticsAggregationDisplayProps) => {
  
  const getChemistryColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getDistributionBadge = (distribution: string) => {
    const colors = {
      'balanced': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'concentrated': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'mixed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'veteran': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'young': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    };
    return colors[distribution as keyof typeof colors] || colors.mixed;
  };

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Team Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{statistics.totalGoals}</div>
              <p className="text-sm text-muted-foreground">Total Goals</p>
              <p className="text-xs text-muted-foreground">{statistics.goalsPerMatch}/match</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{statistics.totalAssists}</div>
              <p className="text-sm text-muted-foreground">Total Assists</p>
              <p className="text-xs text-muted-foreground">{statistics.assistsPerMatch}/match</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{statistics.activePlayers}/{statistics.totalPlayers}</div>
              <p className="text-sm text-muted-foreground">Active Players</p>
              <p className="text-xs text-muted-foreground">{Math.round(statistics.activePlayers / statistics.totalPlayers * 100)}% utilization</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChemistryColor(insights.team_chemistry_score)}`}>
                {insights.team_chemistry_score}
              </div>
              <p className="text-sm text-muted-foreground">Team Chemistry</p>
              <Progress value={insights.team_chemistry_score} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.topScorer && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Top Scorer</span>
                </div>
                <p className="font-semibold">{topPerformers.topScorer.name}</p>
                <p className="text-sm text-muted-foreground">{topPerformers.topScorer.goals} goals</p>
              </div>
            )}
            
            {topPerformers.topAssister && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Top Assister</span>
                </div>
                <p className="font-semibold">{topPerformers.topAssister.name}</p>
                <p className="text-sm text-muted-foreground">{topPerformers.topAssister.assists} assists</p>
              </div>
            )}
            
            {topPerformers.highestContribution && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Highest Impact</span>
                </div>
                <p className="font-semibold">{topPerformers.highestContribution.name}</p>
                <p className="text-sm text-muted-foreground">{topPerformers.highestContribution.contributionScore} contribution</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Position */}
            <div>
              <h4 className="font-medium mb-3">By Position</h4>
              <div className="space-y-2">
                {Object.entries(breakdown.byPosition).map(([position, data]) => (
                  <div key={position} className="flex justify-between items-center p-2 rounded bg-muted/30">
                    <span className="font-medium">{position}</span>
                    <div className="text-right">
                      <p className="text-sm">{data.playerCount} players</p>
                      <p className="text-xs text-muted-foreground">
                        {data.totalGoals}G {data.totalAssists}A
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Role */}
            <div>
              <h4 className="font-medium mb-3">By Role</h4>
              <div className="space-y-2">
                {Object.entries(breakdown.byRole).map(([role, data]) => (
                  <div key={role} className="flex justify-between items-center p-2 rounded bg-muted/30">
                    <span className="font-medium">{role}</span>
                    <div className="text-right">
                      <p className="text-sm">{data.playerCount} players</p>
                      <p className="text-xs text-muted-foreground">
                        {data.totalGoals}G {data.totalAssists}A
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Team Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="flex items-center gap-2 font-medium mb-3 text-green-700 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                Strengths
              </h4>
              <div className="space-y-2">
                {insights.strengths.map((strength, index) => (
                  <Badge key={index} variant="outline" className="block text-center py-2">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="flex items-center gap-2 font-medium mb-3 text-orange-700 dark:text-orange-400">
                <TrendingDown className="h-4 w-4" />
                Areas to Improve
              </h4>
              <div className="space-y-2">
                {insights.areas_for_improvement.map((area, index) => (
                  <Badge key={index} variant="outline" className="block text-center py-2">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notable Patterns */}
            <div>
              <h4 className="flex items-center gap-2 font-medium mb-3 text-blue-700 dark:text-blue-400">
                <Clock className="h-4 w-4" />
                Notable Patterns
              </h4>
              <div className="space-y-2">
                {insights.notable_patterns.map((pattern, index) => (
                  <Badge key={index} variant="outline" className="block text-center py-2">
                    {pattern}
                  </Badge>
                ))}
                <Badge className={getDistributionBadge(statistics.goalDistribution)}>
                  Goal Distribution: {statistics.goalDistribution}
                </Badge>
                <Badge className={getDistributionBadge(statistics.experienceDistribution)}>
                  Experience: {statistics.experienceDistribution}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Avg Goals/Player</p>
              <p className="font-semibold">{statistics.averageGoalsPerPlayer}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Assists/Player</p>
              <p className="font-semibold">{statistics.averageAssistsPerPlayer}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Player Efficiency</p>
              <p className="font-semibold">{statistics.playerEfficiency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Disciplinary Rate</p>
              <p className="font-semibold">{statistics.disciplinaryRate} cards/match</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Minutes/Player</p>
              <p className="font-semibold">{statistics.averageMinutesPerPlayer}min</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Cards</p>
              <p className="font-semibold">{statistics.totalCards}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Squad Utilization</p>
              <p className="font-semibold">{Math.round(statistics.activePlayers / statistics.totalPlayers * 100)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Contribution</p>
              <p className="font-semibold">{statistics.averageContributionScore}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamStatisticsAggregationDisplay;
