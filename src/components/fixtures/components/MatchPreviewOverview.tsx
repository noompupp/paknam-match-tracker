
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users, Target } from "lucide-react";
import { Team, Fixture } from "@/types/database";
import { formatDateDisplay } from "@/utils/timeUtils";

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
    form: `${team.won}W ${team.drawn}D ${team.lost}L`
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* League Positions */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            League Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="text-center space-y-2 p-3 rounded-lg bg-muted/30 sm:bg-transparent sm:p-0">
              <h4 className="font-semibold text-sm sm:text-base">{homeTeam.name}</h4>
              <div className="space-y-1">
                <Badge variant="outline" className="text-base sm:text-lg font-bold">
                  #{homeStats.position}
                </Badge>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {homeStats.points} pts • {homeStats.played} played
                </p>
                <p className="text-xs text-muted-foreground">
                  GD: {homeStats.goalDifference > 0 ? '+' : ''}{homeStats.goalDifference}
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-2 p-3 rounded-lg bg-muted/30 sm:bg-transparent sm:p-0">
              <h4 className="font-semibold text-sm sm:text-base">{awayTeam.name}</h4>
              <div className="space-y-1">
                <Badge variant="outline" className="text-base sm:text-lg font-bold">
                  #{awayStats.position}
                </Badge>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {awayStats.points} pts • {awayStats.played} played
                </p>
                <p className="text-xs text-muted-foreground">
                  GD: {awayStats.goalDifference > 0 ? '+' : ''}{awayStats.goalDifference}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season Form */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Season Record
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="text-center space-y-2 p-3 rounded-lg bg-muted/30 sm:bg-transparent sm:p-0">
              <h4 className="font-semibold text-sm sm:text-base">{homeTeam.name}</h4>
              <p className="text-sm font-mono">{homeStats.form}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Goals: {homeTeam.goals_for} scored, {homeTeam.goals_against} conceded</p>
              </div>
            </div>
            
            <div className="text-center space-y-2 p-3 rounded-lg bg-muted/30 sm:bg-transparent sm:p-0">
              <h4 className="font-semibold text-sm sm:text-base">{awayTeam.name}</h4>
              <p className="text-sm font-mono">{awayStats.form}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Goals: {awayTeam.goals_for} scored, {awayTeam.goals_against} conceded</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Head to Head */}
      {headToHead.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              Head to Head ({headToHead.length} matches)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center flex-1">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{h2hSummary.homeWins}</div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{homeTeam.name}</p>
              </div>
              
              <div className="text-center flex-1">
                <div className="text-xl sm:text-2xl font-bold text-gray-600">{h2hSummary.draws}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Draws</p>
              </div>
              
              <div className="text-center flex-1">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{h2hSummary.awayWins}</div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{awayTeam.name}</p>
              </div>
            </div>
            
            {headToHead.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Meetings:</p>
                <div className="space-y-1">
                  {headToHead.slice(0, 3).map((match) => (
                    <div key={match.id} className="text-xs text-muted-foreground flex justify-between p-2 rounded bg-muted/30">
                      <span>{formatDateDisplay(match.match_date)}</span>
                      <span className="font-medium">{match.home_score} - {match.away_score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchPreviewOverview;
