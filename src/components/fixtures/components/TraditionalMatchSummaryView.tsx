
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, AlertTriangle } from "lucide-react";
import EnhancedMatchEventsTimeline from "../../referee/components/EnhancedMatchEventsTimeline";

interface TraditionalMatchSummaryViewProps {
  fixture: any;
  goals: any[];
  cards: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  formatTime: (seconds: number) => string;
  getGoalTeamId: (goal: any) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const TraditionalMatchSummaryView = ({
  fixture,
  goals,
  cards,
  enhancedSuccess,
  enhancedData,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: TraditionalMatchSummaryViewProps) => {
  const getResult = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'Home Win';
    if (awayScore > homeScore) return 'Away Win';
    return 'Draw';
  };

  const getResultColor = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'text-green-600';
    if (awayScore > homeScore) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const homeGoals = goals.filter(g => getGoalTeamId(g) === fixture?.home_team_id);
  const awayGoals = goals.filter(g => getGoalTeamId(g) === fixture?.away_team_id);
  const homeCards = cards.filter(c => getCardTeamId(c) === fixture?.home_team_id);
  const awayCards = cards.filter(c => getCardTeamId(c) === fixture?.away_team_id);

  return (
    <>
      {/* Traditional Full View */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="font-bold text-lg">{fixture.home_team?.name}</p>
                <p className="text-3xl font-bold">{fixture.home_score || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">VS</p>
                <Badge variant="outline" className={getResultColor()}>
                  {getResult()}
                </Badge>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{fixture.away_team?.name}</p>
                <p className="text-3xl font-bold">{fixture.away_score || 0}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>📅 {fixture.match_date}</span>
              {fixture.venue && <span>📍 {fixture.venue}</span>}
              <span>🏆 {fixture.status}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Timeline */}
      {enhancedSuccess && enhancedData?.timelineEvents?.length > 0 && (
        <>
          <EnhancedMatchEventsTimeline
            timelineEvents={enhancedData.timelineEvents}
            formatTime={formatTime}
          />
          <Separator />
        </>
      )}

      {/* Goals Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals ({goals.length})
          </h4>
          
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No goals recorded</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-sm mb-2">{fixture.home_team?.name}</h5>
                <div className="space-y-1">
                  {homeGoals.map((goal, index) => (
                    <div key={`home-goal-${goal.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <Badge variant="default" className="mr-2">goal</Badge>
                        <span>{getGoalPlayerName(goal)}</span>
                        {goal.assistPlayerName && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Assist: {goal.assistPlayerName}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(getGoalTime(goal))}
                      </span>
                    </div>
                  ))}
                  {homeGoals.length === 0 && (
                    <p className="text-xs text-muted-foreground">No goals</p>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-sm mb-2">{fixture.away_team?.name}</h5>
                <div className="space-y-1">
                  {awayGoals.map((goal, index) => (
                    <div key={`away-goal-${goal.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <Badge variant="default" className="mr-2">goal</Badge>
                        <span>{getGoalPlayerName(goal)}</span>
                        {goal.assistPlayerName && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Assist: {goal.assistPlayerName}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(getGoalTime(goal))}
                      </span>
                    </div>
                  ))}
                  {awayGoals.length === 0 && (
                    <p className="text-xs text-muted-foreground">No goals</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Cards ({cards.length})
          </h4>
          
          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No cards issued</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-sm mb-2">{fixture.home_team?.name}</h5>
                <div className="space-y-1">
                  {homeCards.map((card, index) => (
                    <div key={`home-card-${card.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="mr-2">
                          {getCardType(card)}
                        </Badge>
                        <span>{getCardPlayerName(card)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(getCardTime(card))}
                      </span>
                    </div>
                  ))}
                  {homeCards.length === 0 && (
                    <p className="text-xs text-muted-foreground">No cards</p>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-sm mb-2">{fixture.away_team?.name}</h5>
                <div className="space-y-1">
                  {awayCards.map((card, index) => (
                    <div key={`away-card-${card.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="mr-2">
                          {getCardType(card)}
                        </Badge>
                        <span>{getCardPlayerName(card)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(getCardTime(card))}
                      </span>
                    </div>
                  ))}
                  {awayCards.length === 0 && (
                    <p className="text-xs text-muted-foreground">No cards</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default TraditionalMatchSummaryView;
