
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface PremierLeagueStyleSummaryProps {
  fixture: any;
  goals: any[];
  cards: any[];
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

const PremierLeagueStyleSummary = ({
  fixture,
  goals,
  cards,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: PremierLeagueStyleSummaryProps) => {
  const [cardsExpanded, setCardsExpanded] = useState(false);

  // Enhanced time formatting for match minutes
  const formatMatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  // Get goals for each team
  const homeGoals = goals.filter(g => getGoalTeamId(g) === fixture?.home_team_id);
  const awayGoals = goals.filter(g => getGoalTeamId(g) === fixture?.away_team_id);

  // Get cards for each team
  const homeCards = cards.filter(c => getCardTeamId(c) === fixture?.home_team_id);
  const awayCards = cards.filter(c => getCardTeamId(c) === fixture?.away_team_id);

  const hasCards = cards.length > 0;

  return (
    <div className="space-y-6">
      {/* Premier League Style Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-8 mb-4">
          {/* Home Team */}
          <div className="flex flex-col items-center min-w-[120px]">
            <div className="text-lg font-semibold mb-1">{fixture.home_team?.name}</div>
            <div className="text-4xl font-bold text-primary">{fixture.home_score || 0}</div>
          </div>
          
          {/* VS Separator */}
          <div className="flex flex-col items-center">
            <div className="text-sm text-muted-foreground mb-1">FULL TIME</div>
            <div className="w-8 h-0.5 bg-border"></div>
          </div>
          
          {/* Away Team */}
          <div className="flex flex-col items-center min-w-[120px]">
            <div className="text-lg font-semibold mb-1">{fixture.away_team?.name}</div>
            <div className="text-4xl font-bold text-primary">{fixture.away_score || 0}</div>
          </div>
        </div>
        
        {/* Match Info */}
        <div className="text-sm text-muted-foreground">
          {fixture.match_date} {fixture.venue && `• ${fixture.venue}`}
        </div>
      </div>

      {/* Goals Section - Centralized */}
      {goals.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              {/* Home Team Goals */}
              <div className="flex-1">
                <div className="space-y-2">
                  {homeGoals.map((goal, index) => (
                    <div key={`home-goal-${goal.id}-${index}`} className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getGoalPlayerName(goal)}</span>
                        <span className="text-sm text-muted-foreground">{formatMatchTime(getGoalTime(goal))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Divider */}
              <div className="px-4">
                <div className="w-px h-full bg-border min-h-[20px]"></div>
              </div>

              {/* Away Team Goals */}
              <div className="flex-1">
                <div className="space-y-2">
                  {awayGoals.map((goal, index) => (
                    <div key={`away-goal-${goal.id}-${index}`} className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">{formatMatchTime(getGoalTime(goal))}</span>
                        <span className="font-medium">{getGoalPlayerName(goal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {goals.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No goals scored
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Collapsible Cards Section */}
      {hasCards && (
        <Collapsible open={cardsExpanded} onOpenChange={setCardsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Disciplinary ({cards.length})</span>
              {cardsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  {/* Home Team Cards */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      {homeCards.map((card, index) => (
                        <div key={`home-card-${card.id}-${index}`} className="text-left">
                          <div className="flex items-center gap-2">
                            <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="text-xs">
                              {getCardType(card)}
                            </Badge>
                            <span className="font-medium">{getCardPlayerName(card)}</span>
                            <span className="text-sm text-muted-foreground">{formatMatchTime(getCardTime(card))}</span>
                          </div>
                        </div>
                      ))}
                      {homeCards.length === 0 && (
                        <div className="text-sm text-muted-foreground">No cards</div>
                      )}
                    </div>
                  </div>

                  {/* Center Divider */}
                  <div className="px-4">
                    <div className="w-px h-full bg-border min-h-[20px]"></div>
                  </div>

                  {/* Away Team Cards */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      {awayCards.map((card, index) => (
                        <div key={`away-card-${card.id}-${index}`} className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm text-muted-foreground">{formatMatchTime(getCardTime(card))}</span>
                            <span className="font-medium">{getCardPlayerName(card)}</span>
                            <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="text-xs">
                              {getCardType(card)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {awayCards.length === 0 && (
                        <div className="text-sm text-muted-foreground">No cards</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Match Statistics Footer */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-bold text-lg">{goals.filter(g => getGoalTeamId(g) === fixture?.home_team_id).length}</div>
            <div className="text-muted-foreground">Goals</div>
          </div>
          <div>
            <div className="font-bold text-lg">{cards.length}</div>
            <div className="text-muted-foreground">Cards</div>
          </div>
          <div>
            <div className="font-bold text-lg">{goals.filter(g => getGoalTeamId(g) === fixture?.away_team_id).length}</div>
            <div className="text-muted-foreground">Goals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremierLeagueStyleSummary;
