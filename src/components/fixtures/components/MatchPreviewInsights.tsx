
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@/types/database";
import { TrendingUp, Target, Users, Calendar } from "lucide-react";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { cn } from "@/lib/utils";

interface MatchPreviewInsightsProps {
  homeTeam: Team;
  awayTeam: Team;
}

const MatchPreviewInsights = ({ homeTeam, awayTeam }: MatchPreviewInsightsProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  // Calculate position difference
  const positionDifference = Math.abs(homeTeam.position - awayTeam.position);
  
  // Calculate form insights
  const homeTeamForm = {
    winRate: homeTeam.played > 0 ? ((homeTeam.won / homeTeam.played) * 100).toFixed(1) : "0.0",
    avgGoalsFor: homeTeam.played > 0 ? (homeTeam.goals_for / homeTeam.played).toFixed(1) : "0.0",
    avgGoalsAgainst: homeTeam.played > 0 ? (homeTeam.goals_against / homeTeam.played).toFixed(1) : "0.0"
  };

  const awayTeamForm = {
    winRate: awayTeam.played > 0 ? ((awayTeam.won / awayTeam.played) * 100).toFixed(1) : "0.0",
    avgGoalsFor: awayTeam.played > 0 ? (awayTeam.goals_for / awayTeam.played).toFixed(1) : "0.0",
    avgGoalsAgainst: awayTeam.played > 0 ? (awayTeam.goals_against / awayTeam.played).toFixed(1) : "0.0"
  };

  // Generate match insights
  const insights = [
    {
      title: "Position Battle",
      description: positionDifference <= 2 
        ? "Close contest expected - both teams are similarly positioned" 
        : homeTeam.position < awayTeam.position 
          ? `${homeTeam.name} holds the upper hand with a ${positionDifference} position advantage`
          : `${awayTeam.name} comes in as the higher-ranked side with a ${positionDifference} position lead`,
      icon: Target,
      type: positionDifference <= 2 ? "neutral" : "info"
    },
    {
      title: "Goal Expectation",
      description: `${homeTeam.name} averages ${homeTeamForm.avgGoalsFor} goals, ${awayTeam.name} averages ${awayTeamForm.avgGoalsFor} - expect ${(parseFloat(homeTeamForm.avgGoalsFor) + parseFloat(awayTeamForm.avgGoalsFor)).toFixed(1)} total goals`,
      icon: TrendingUp,
      type: "info"
    },
    {
      title: "Form Analysis",
      description: parseFloat(homeTeamForm.winRate) > parseFloat(awayTeamForm.winRate)
        ? `${homeTeam.name} has the better win rate (${homeTeamForm.winRate}% vs ${awayTeamForm.winRate}%)`
        : parseFloat(awayTeamForm.winRate) > parseFloat(homeTeamForm.winRate)
          ? `${awayTeam.name} has the better win rate (${awayTeamForm.winRate}% vs ${homeTeamForm.winRate}%)`
          : `Both teams have identical win rates (${homeTeamForm.winRate}%)`,
      icon: Users,
      type: "neutral"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Match Insights */}
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Match Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className={cn(
                  "flex-shrink-0 p-2 rounded-full",
                  insight.type === "info" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={cn(
                    "font-medium mb-1",
                    isMobilePortrait ? "text-sm" : "text-base"
                  )}>
                    {insight.title}
                  </h4>
                  <p className={cn(
                    "text-muted-foreground leading-relaxed",
                    isMobilePortrait ? "text-xs" : "text-sm"
                  )}>
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Team Comparison Stats */}
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Team Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={cn(
                "font-bold text-primary",
                isMobilePortrait ? "text-lg" : "text-xl"
              )}>
                {homeTeam.name}
              </div>
              <div className={cn(
                "text-muted-foreground",
                isMobilePortrait ? "text-xs" : "text-sm"
              )}>
                Home
              </div>
            </div>
            <div className="text-center">
              <div className={cn(
                "font-medium text-muted-foreground",
                isMobilePortrait ? "text-xs" : "text-sm"
              )}>
                VS
              </div>
            </div>
            <div className="text-center">
              <div className={cn(
                "font-bold text-primary",
                isMobilePortrait ? "text-lg" : "text-xl"
              )}>
                {awayTeam.name}
              </div>
              <div className={cn(
                "text-muted-foreground",
                isMobilePortrait ? "text-xs" : "text-sm"
              )}>
                Away
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {[
              { label: "Win Rate", home: homeTeamForm.winRate + "%", away: awayTeamForm.winRate + "%" },
              { label: "Avg Goals For", home: homeTeamForm.avgGoalsFor, away: awayTeamForm.avgGoalsFor },
              { label: "Avg Goals Against", home: homeTeamForm.avgGoalsAgainst, away: awayTeamForm.avgGoalsAgainst },
              { label: "League Position", home: homeTeam.position.toString(), away: awayTeam.position.toString() },
              { label: "Points", home: homeTeam.points.toString(), away: awayTeam.points.toString() }
            ].map((stat, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-border/30 last:border-b-0">
                <div className={cn(
                  "text-center font-medium",
                  isMobilePortrait ? "text-sm" : "text-base"
                )}>
                  {stat.home}
                </div>
                <div className={cn(
                  "text-center text-muted-foreground font-medium",
                  isMobilePortrait ? "text-xs" : "text-sm"
                )}>
                  {stat.label}
                </div>
                <div className={cn(
                  "text-center font-medium",
                  isMobilePortrait ? "text-sm" : "text-base"
                )}>
                  {stat.away}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchPreviewInsights;
