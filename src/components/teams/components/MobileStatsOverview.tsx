import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Clock, Users, Award } from "lucide-react";
import type { TeamStatsOverview } from "@/services/enhancedTeamStatsService";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { cn } from "@/lib/utils";

interface MobileStatsOverviewProps {
  overview: TeamStatsOverview;
}

const MobileStatsOverview = ({ overview }: MobileStatsOverviewProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();

  // Mobile portrait - ultra compact grid
  if (isMobile && isPortrait) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Team Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-lg font-bold text-primary">{overview.totalGoals}</div>
              <p className="text-xs text-muted-foreground">Goals</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-lg font-bold text-secondary">{overview.totalAssists}</div>
              <p className="text-xs text-muted-foreground">Assists</p>
            </div>
          </div>

          {overview.topScorer && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                    {overview.topScorer.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Top Scorer • {overview.topScorer.goals} goals
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Mobile landscape - 2-column layout
  if (isMobile && !isPortrait) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-background/50">
                <div className="text-xl font-bold text-primary">{overview.totalGoals}</div>
                <p className="text-xs text-muted-foreground">Goals</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <div className="text-xl font-bold text-secondary">{overview.totalAssists}</div>
                <p className="text-xs text-muted-foreground">Assists</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {overview.topScorer && (
                <div className="p-2 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Award className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-green-800 dark:text-green-200 truncate">
                        {overview.topScorer.name}
                      </p>
                      <p className="text-[10px] text-green-600 dark:text-green-400">
                        {overview.topScorer.goals}G
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {overview.topAssister && (
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">
                        {overview.topAssister.name}
                      </p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400">
                        {overview.topAssister.assists}A
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop - full layout (keep existing)
  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Team Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{overview.totalGoals}</div>
            <p className="text-sm text-muted-foreground">Total Goals</p>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.averageGoalsPerMatch}/match avg
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-1">{overview.totalAssists}</div>
            <p className="text-sm text-muted-foreground">Total Assists</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supporting plays
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-1">{overview.totalPlayers}</div>
            <p className="text-sm text-muted-foreground">Squad Size</p>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.averageMinutesPerPlayer}min avg
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-1">{overview.totalMatches}</div>
            <p className="text-sm text-muted-foreground">Total Matches</p>
            <p className="text-xs text-muted-foreground mt-1">
              This season
            </p>
          </div>
        </div>

        {(overview.topScorer || overview.topAssister || overview.mostExperienced) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {overview.topScorer && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">Top Scorer</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{overview.topScorer.name}</p>
                    <Badge className="mt-1 bg-green-600 text-white">
                      {overview.topScorer.goals} goals
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {overview.topAssister && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Top Assister</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{overview.topAssister.name}</p>
                    <Badge className="mt-1 bg-blue-600 text-white">
                      {overview.topAssister.assists} assists
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {overview.mostExperienced && (
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-800 dark:text-purple-200">Most Minutes</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{overview.mostExperienced.name}</p>
                    <Badge className="mt-1 bg-purple-600 text-white">
                      {Math.round(overview.mostExperienced.total_minutes_played || 0)}min
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileStatsOverview;
