import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Clock, Users, Award } from "lucide-react";
import type { TeamStatsOverview } from "@/services/enhancedTeamStatsService";

import MobileStatsOverview from "./MobileStatsOverview";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface EnhancedTeamStatsOverviewProps {
  overview: TeamStatsOverview;
}

const EnhancedTeamStatsOverview = ({ overview }: EnhancedTeamStatsOverviewProps) => {
  const { isMobile } = useDeviceOrientation();

  // Use mobile-optimized version for mobile devices
  if (isMobile) {
    return <MobileStatsOverview overview={overview} />;
  }

  // Desktop version
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

export default EnhancedTeamStatsOverview;
