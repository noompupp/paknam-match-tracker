
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Clock, Users, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedTeamStatsOverviewProps {
  totalGoals: number;
  totalAssists: number;
  totalMinutesPlayed: number;
  totalMatches: number;
  topScorer?: any;
  topAssister?: any;
  className?: string;
}

const EnhancedTeamStatsOverview = ({
  totalGoals,
  totalAssists,
  totalMinutesPlayed,
  totalMatches,
  topScorer,
  topAssister,
  className
}: EnhancedTeamStatsOverviewProps) => {
  const formatMinutes = (minutes: number) => {
    if (minutes === 0) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const stats = [
    {
      icon: <Target className="h-4 w-4 text-green-600" />,
      label: "Total Goals",
      value: totalGoals,
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      icon: <Trophy className="h-4 w-4 text-blue-600" />,
      label: "Total Assists", 
      value: totalAssists,
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      icon: <Clock className="h-4 w-4 text-purple-600" />,
      label: "Total Playing Time",
      value: formatMinutes(totalMinutesPlayed),
      color: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      icon: <Users className="h-4 w-4 text-orange-600" />,
      label: "Total Matches",
      value: totalMatches,
      color: "bg-orange-50 text-orange-700 border-orange-200"
    }
  ];

  return (
    <Card className={cn("bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {stat.icon}
                  <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                    {stat.label}
                  </span>
                </div>
                <Badge variant="outline" className={cn("font-semibold text-sm px-3 py-1", stat.color)}>
                  {stat.value}
                </Badge>
              </div>
            ))}
          </div>

          {/* Top Performers */}
          {(topScorer || topAssister) && (
            <div className="pt-3 border-t border-border/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topScorer && (topScorer.goals || 0) > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/30">
                    <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Top Scorer</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {topScorer.name} ({topScorer.goals} goals)
                      </p>
                    </div>
                  </div>
                )}
                
                {topAssister && (topAssister.assists || 0) > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/30">
                    <Trophy className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Top Assister</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {topAssister.name} ({topAssister.assists} assists)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTeamStatsOverview;
