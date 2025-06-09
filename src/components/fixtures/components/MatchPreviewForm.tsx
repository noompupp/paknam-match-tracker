
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";
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
  const getMatchResult = (match: Fixture, teamId: string) => {
    const isHome = match.home_team_id === teamId;
    const teamScore = isHome ? match.home_score : match.away_score;
    const oppScore = isHome ? match.away_score : match.home_score;
    
    if (teamScore === oppScore) return 'D';
    return teamScore! > oppScore! ? 'W' : 'L';
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-500 hover:bg-green-600';
      case 'D': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'L': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getResultDot = (result: string) => {
    const baseClasses = "w-3 h-3 rounded-full";
    switch (result) {
      case 'W': return `${baseClasses} bg-green-500`;
      case 'D': return `${baseClasses} bg-yellow-500`;
      case 'L': return `${baseClasses} bg-red-500`;
      default: return `${baseClasses} bg-gray-500`;
    }
  };

  const calculateFormScore = (matches: Fixture[], teamId: string) => {
    let score = 0;
    matches.forEach(match => {
      const result = getMatchResult(match, teamId);
      if (result === 'W') score += 3;
      else if (result === 'D') score += 1;
    });
    return score;
  };

  const getFormTrend = (matches: Fixture[], teamId: string) => {
    if (matches.length < 3) return { icon: null, color: 'text-muted-foreground', label: 'Insufficient data' };
    
    const recent = matches.slice(0, 3);
    const older = matches.slice(3, 6);
    
    const recentScore = calculateFormScore(recent, teamId) / 3;
    const olderScore = older.length > 0 ? calculateFormScore(older, teamId) / older.length : recentScore;
    
    if (recentScore > olderScore + 0.5) {
      return { icon: TrendingUp, color: 'text-green-600', label: 'Improving' };
    } else if (recentScore < olderScore - 0.5) {
      return { icon: TrendingDown, color: 'text-red-600', label: 'Declining' };
    }
    return { icon: Target, color: 'text-blue-600', label: 'Stable' };
  };

  const getFormPercentage = (matches: Fixture[], teamId: string) => {
    if (matches.length === 0) return 0;
    const score = calculateFormScore(matches, teamId);
    const maxScore = matches.length * 3;
    return (score / maxScore) * 100;
  };

  const TeamFormCard = ({ team, matches, cardColor }: { 
    team: Team, 
    matches: Fixture[], 
    cardColor: string 
  }) => {
    const formTrend = getFormTrend(matches, team.__id__!);
    const formPercentage = getFormPercentage(matches, team.__id__!);
    const FormTrendIcon = formTrend.icon;

    return (
      <Card className={`${cardColor} border-2`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">{team.name}</span>
            <div className="flex items-center gap-2">
              {FormTrendIcon && <FormTrendIcon className={`h-4 w-4 ${formTrend.color}`} />}
              <Badge variant="outline" className={formTrend.color}>
                {formTrend.label}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Percentage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Form Rating</span>
              <span className="font-semibold">{formPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  formPercentage >= 70 ? 'bg-green-500' : 
                  formPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${formPercentage}%` }}
              />
            </div>
          </div>

          {/* Form Dots */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Form (Last {matches.length} matches)</h4>
            <div className="flex items-center gap-2">
              {matches.slice(0, 5).map((match, index) => {
                const result = getMatchResult(match, team.__id__!);
                return (
                  <div key={match.id} className="flex flex-col items-center gap-1">
                    <div className={getResultDot(result)} title={`${result} - ${formatDateDisplay(match.match_date)}`} />
                    <span className="text-xs text-muted-foreground">
                      {index === 0 ? 'Latest' : `${index + 1}`}
                    </span>
                  </div>
                );
              })}
              {matches.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent matches</p>
              )}
            </div>
          </div>

          {/* Recent Matches List */}
          {matches.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Match Results</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {matches.slice(0, 5).map((match) => {
                  const result = getMatchResult(match, team.__id__!);
                  const isHome = match.home_team_id === team.__id__;
                  const teamScore = isHome ? match.home_score : match.away_score;
                  const oppScore = isHome ? match.away_score : match.home_score;
                  
                  return (
                    <div key={match.id} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getResultColor(result)}`}
                        >
                          {result}
                        </Badge>
                        <div className="text-sm">
                          <span className="text-muted-foreground">vs </span>
                          <span className="font-medium">
                            {isHome ? 'Away Team' : 'Home Team'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{teamScore} - {oppScore}</span>
                        <span className="text-muted-foreground">
                          {formatDateDisplay(match.match_date)}
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
      {/* Form Comparison Overview */}
      <Card className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Form Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center space-y-2">
              <h4 className="font-semibold">{homeTeam.name}</h4>
              <div className="text-3xl font-bold text-primary">
                {getFormPercentage(recentForm.homeTeam, homeTeam.__id__!).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Form Rating</p>
              <div className="flex justify-center gap-1">
                {recentForm.homeTeam.slice(0, 5).map((match, index) => {
                  const result = getMatchResult(match, homeTeam.__id__!);
                  return (
                    <div key={match.id} className={getResultDot(result)} />
                  );
                })}
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h4 className="font-semibold">{awayTeam.name}</h4>
              <div className="text-3xl font-bold text-secondary">
                {getFormPercentage(recentForm.awayTeam, awayTeam.__id__!).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Form Rating</p>
              <div className="flex justify-center gap-1">
                {recentForm.awayTeam.slice(0, 5).map((match, index) => {
                  const result = getMatchResult(match, awayTeam.__id__!);
                  return (
                    <div key={match.id} className={getResultDot(result)} />
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Team Form */}
      <div className="space-y-6">
        <TeamFormCard 
          team={homeTeam} 
          matches={recentForm.homeTeam} 
          cardColor="bg-gradient-to-r from-primary/5 to-transparent border-primary/30"
        />
        
        <TeamFormCard 
          team={awayTeam} 
          matches={recentForm.awayTeam} 
          cardColor="bg-gradient-to-l from-secondary/5 to-transparent border-secondary/30"
        />
      </div>

      {/* Form Legend */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Win</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Draw</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Loss</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchPreviewForm;
