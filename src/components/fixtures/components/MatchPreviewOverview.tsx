
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Activity, Zap } from "lucide-react";
import { Team, Fixture } from "@/types/database";
import { formatDateDisplay } from "@/utils/timeUtils";
import MatchPreviewLeagueTable from "./MatchPreviewLeagueTable";
import { calculateMatchInsights } from "./MatchInsightsCalculator";

interface MatchPreviewOverviewProps {
  homeTeam: Team;
  awayTeam: Team;
  headToHead: Fixture[];
}

const MatchPreviewOverview = ({ homeTeam, awayTeam, headToHead }: MatchPreviewOverviewProps) => {
  const getTeamStats = (team: Team) => ({
    position: team.position,
    points: team.points,
    played: team.played,
    goalDifference: team.goal_difference,
    form: `${team.won}W ${team.drawn}D ${team.lost}L`,
    attackStrength: team.goals_for / Math.max(team.played, 1),
    defenseStrength: team.goals_against / Math.max(team.played, 1)
  });

  const homeStats = getTeamStats(homeTeam);
  const awayStats = getTeamStats(awayTeam);

  const getHeadToHeadSummary = () => {
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;

    headToHead.forEach(match => {
      if (match.home_score === match.away_score) {
        draws++;
      } else if (
        (match.home_team_id === homeTeam.__id__ && match.home_score! > match.away_score!) ||
        (match.away_team_id === homeTeam.__id__ && match.away_score! > match.home_score!)
      ) {
        homeWins++;
      } else {
        awayWins++;
      }
    });

    return { homeWins, awayWins, draws };
  };

  const h2hSummary = getHeadToHeadSummary();

  const getFormColor = (won: number, total: number) => {
    const percentage = won / Math.max(total, 1);
    if (percentage >= 0.7) return 'text-green-600';
    if (percentage >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const matchInsights = calculateMatchInsights(homeTeam, awayTeam);

  return (
    <div className="space-y-6">
      {/* League Table with Highlighted Teams */}
      <MatchPreviewLeagueTable 
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />

      {/* Team Performance Metrics */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-secondary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Home Team Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-center text-lg border-b pb-2">{homeTeam.name}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-sm text-muted-foreground">Season Record</span>
                  <span className={`font-mono text-sm ${getFormColor(homeTeam.won, homeStats.played)}`}>
                    {homeStats.form}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-sm text-muted-foreground">Goal Difference</span>
                  <span className={`font-semibold ${homeStats.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {homeStats.goalDifference > 0 ? '+' : ''}{homeStats.goalDifference}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-sm text-muted-foreground">Goals/Game</span>
                  <span className="font-semibold">{homeStats.attackStrength.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-sm text-muted-foreground">Conceded/Game</span>
                  <span className="font-semibold">{homeStats.defenseStrength.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Away Team Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-center text-lg border-b pb-2">{awayTeam.name}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-sm text-muted-foreground">Season Record</span>
                  <span className={`font-mono text-sm ${getFormColor(awayTeam.won, awayStats.played)}`}>
                    {awayStats.form}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-sm text-muted-foreground">Goal Difference</span>
                  <span className={`font-semibold ${awayStats.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {awayStats.goalDifference > 0 ? '+' : ''}{awayStats.goalDifference}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-sm text-muted-foreground">Goals/Game</span>
                  <span className="font-semibold">{awayStats.attackStrength.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-sm text-muted-foreground">Conceded/Game</span>
                  <span className="font-semibold">{awayStats.defenseStrength.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Head to Head */}
      {headToHead.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Head to Head Record
              <Badge variant="outline" className="ml-auto">
                {headToHead.length} matches
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* H2H Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">{h2hSummary.homeWins}</div>
                <p className="text-sm text-green-700 font-medium truncate">{homeTeam.name} wins</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-3xl font-bold text-gray-600 mb-1">{h2hSummary.draws}</div>
                <p className="text-sm text-gray-700 font-medium">Draws</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">{h2hSummary.awayWins}</div>
                <p className="text-sm text-blue-700 font-medium truncate">{awayTeam.name} wins</p>
              </div>
            </div>
            
            {/* Recent Meetings */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm text-muted-foreground mb-3">Recent Meetings:</h5>
              <div className="space-y-2">
                {headToHead.slice(0, 5).map((match, index) => (
                  <div key={match.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-sm text-muted-foreground">
                      {formatDateDisplay(match.match_date)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {match.home_score} - {match.away_score}
                      </span>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">Latest</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Match Insights */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Match Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {matchInsights.map((insight, index) => (
              <div key={index} className={`p-3 rounded-lg border ${insight.color}`}>
                <h6 className="font-semibold text-sm mb-1">{insight.title}</h6>
                <p className="text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchPreviewOverview;
