
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, Users, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamStatsOverview } from "@/services/enhancedTeamStatsService";
import { usePlayerStatsFormatting } from "@/hooks/useEnhancedTeamStats";

interface EnhancedTeamStatsOverviewProps {
  overview: TeamStatsOverview;
  className?: string;
}

const EnhancedTeamStatsOverview = ({ overview, className }: EnhancedTeamStatsOverviewProps) => {
  const { formatMinutes, formatStat } = usePlayerStatsFormatting();

  const statCards = [
    {
      title: "Total Goals",
      value: overview.totalGoals,
      icon: Trophy,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
    },
    {
      title: "Total Assists", 
      value: overview.totalAssists,
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Squad Size",
      value: overview.totalPlayers,
      icon: Users,
      color: "text-green-600 dark:text-green-400", 
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Total Minutes",
      value: formatMinutes(overview.totalMinutes),
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      isString: true
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="premier-league-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {stat.isString ? stat.value : formatStat(stat.value as number)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Highlights */}
      <Card className="premier-league-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-primary" />
            Team Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Scorer */}
            {overview.topScorer && (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20 dark:to-transparent rounded-lg border border-yellow-200/50 dark:border-yellow-800/30">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Top Scorer</p>
                  <p className="font-semibold text-foreground truncate">{overview.topScorer.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {overview.topScorer.goals} goals
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {overview.topScorer.goalsPerMatch}/match
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Top Assister */}
            {overview.topAssister && (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Top Assister</p>
                  <p className="font-semibold text-foreground truncate">{overview.topAssister.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {overview.topAssister.assists} assists
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {overview.topAssister.assistsPerMatch}/match
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Most Experienced */}
            {overview.mostExperienced && (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent rounded-lg border border-green-200/50 dark:border-green-800/30">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Most Experienced</p>
                  <p className="font-semibold text-foreground truncate">{overview.mostExperienced.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {formatMinutes(overview.mostExperienced.total_minutes_played)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {overview.mostExperienced.matches_played} matches
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Team Metrics */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{overview.averageGoalsPerMatch}</p>
                <p className="text-xs text-muted-foreground">Goals/Match</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{formatMinutes(overview.averageMinutesPerPlayer)}</p>
                <p className="text-xs text-muted-foreground">Avg Minutes/Player</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{overview.totalMatches}</p>
                <p className="text-xs text-muted-foreground">Matches Played</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {overview.totalGoals + overview.totalAssists}
                </p>
                <p className="text-xs text-muted-foreground">Total Contributions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTeamStatsOverview;
