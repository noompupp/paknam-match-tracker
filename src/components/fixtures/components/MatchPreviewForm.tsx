
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Team, Fixture } from "@/types/database";
import { formatDateDisplay } from "@/utils/timeUtils";

interface MatchPreviewFormProps {
  homeTeam: Team;
  awayTeam: Team;
  recentForm: {
    homeTeam: Fixture[];
    awayTeam: Fixture[];
  };
}

const MatchPreviewForm = ({ homeTeam, awayTeam, recentForm }: MatchPreviewFormProps) => {
  const getMatchResult = (fixture: Fixture, teamId: string) => {
    const isHome = fixture.home_team_id === teamId;
    const teamScore = isHome ? fixture.home_score : fixture.away_score;
    const opponentScore = isHome ? fixture.away_score : fixture.home_score;
    
    if (teamScore === null || opponentScore === null) return null;
    
    if (teamScore > opponentScore) return 'W';
    if (teamScore < opponentScore) return 'L';
    return 'D';
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'W':
        return 'bg-green-600 text-white';
      case 'L':
        return 'bg-red-600 text-white';
      case 'D':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getResultIcon = (result: string | null) => {
    switch (result) {
      case 'W':
        return <TrendingUp className="h-3 w-3" />;
      case 'L':
        return <TrendingDown className="h-3 w-3" />;
      case 'D':
        return <Minus className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const FormCard = ({ team, matches, teamId }: {
    team: Team;
    matches: Fixture[];
    teamId: string;
  }) => {
    const recentResults = matches.slice(0, 5);
    const wins = recentResults.filter(m => getMatchResult(m, teamId) === 'W').length;
    const draws = recentResults.filter(m => getMatchResult(m, teamId) === 'D').length;
    const losses = recentResults.filter(m => getMatchResult(m, teamId) === 'L').length;
    
    const goalsScored = recentResults.reduce((total, match) => {
      const isHome = match.home_team_id === teamId;
      const goals = isHome ? (match.home_score || 0) : (match.away_score || 0);
      return total + goals;
    }, 0);
    
    const goalsConceded = recentResults.reduce((total, match) => {
      const isHome = match.home_team_id === teamId;
      const goals = isHome ? (match.away_score || 0) : (match.home_score || 0);
      return total + goals;
    }, 0);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{team.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Strip */}
          <div>
            <h4 className="text-sm font-medium mb-2">Last 5 Matches</h4>
            <div className="flex gap-1">
              {recentResults.map((match, index) => {
                const result = getMatchResult(match, teamId);
                return (
                  <Badge
                    key={match.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${getResultColor(result)}`}
                  >
                    {getResultIcon(result) || result || '?'}
                  </Badge>
                );
              })}
              
              {/* Fill remaining slots if less than 5 matches */}
              {Array.from({ length: Math.max(0, 5 - recentResults.length) }).map((_, index) => (
                <Badge
                  key={`empty-${index}`}
                  variant="outline"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                >
                  -
                </Badge>
              ))}
            </div>
          </div>

          {/* Recent Form Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{wins}</div>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{draws}</div>
              <p className="text-xs text-muted-foreground">Draws</p>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{losses}</div>
              <p className="text-xs text-muted-foreground">Losses</p>
            </div>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-lg font-bold">{goalsScored}</div>
              <p className="text-xs text-muted-foreground">Goals For</p>
            </div>
            <div>
              <div className="text-lg font-bold">{goalsConceded}</div>
              <p className="text-xs text-muted-foreground">Goals Against</p>
            </div>
          </div>

          {/* Recent Matches Details */}
          {recentResults.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Results</h4>
              <div className="space-y-1">
                {recentResults.slice(0, 3).map((match) => {
                  const isHome = match.home_team_id === teamId;
                  const result = getMatchResult(match, teamId);
                  
                  return (
                    <div key={match.id} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        {formatDateDisplay(match.match_date)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className={`w-5 h-5 rounded-full text-xs ${getResultColor(result)}`}>
                          {result}
                        </Badge>
                        <span>
                          {isHome ? 'vs' : 'at'} {isHome ? match.away_team?.name || 'TBD' : match.home_team?.name || 'TBD'}
                        </span>
                        <span className="font-mono">
                          {match.home_score}-{match.away_score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <FormCard 
        team={homeTeam}
        matches={recentForm.homeTeam}
        teamId={homeTeam.__id__}
      />
      
      <FormCard 
        team={awayTeam}
        matches={recentForm.awayTeam}
        teamId={awayTeam.__id__}
      />
    </div>
  );
};

export default MatchPreviewForm;
