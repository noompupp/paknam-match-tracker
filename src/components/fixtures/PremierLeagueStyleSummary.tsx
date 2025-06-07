
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useState } from "react";
import TeamLogoDisplay from "./TeamLogoDisplay";
import EnhancedMatchDetails from "./EnhancedMatchDetails";

interface PremierLeagueStyleSummaryProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
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
  timelineEvents,
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
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  // Enhanced time formatting for match minutes
  const formatMatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  // Process timeline events for chronological display
  const chronologicalGoals = timelineEvents
    .filter(event => event.type === 'goal')
    .sort((a, b) => a.time - b.time);

  const chronologicalAssists = timelineEvents
    .filter(event => event.type === 'assist')
    .sort((a, b) => a.time - b.time);

  // Group goals by team for display
  const homeGoals = chronologicalGoals.filter(goal => 
    goal.teamId === fixture?.home_team_id
  );
  const awayGoals = chronologicalGoals.filter(goal => 
    goal.teamId === fixture?.away_team_id
  );

  // Get cards for each team
  const homeCards = cards.filter(c => getCardTeamId(c) === fixture?.home_team_id);
  const awayCards = cards.filter(c => getCardTeamId(c) === fixture?.away_team_id);

  const hasCards = cards.length > 0;

  // Team colors (you might want to fetch these from the database)
  const homeTeamColor = fixture.home_team?.color || "#3B82F6";
  const awayTeamColor = fixture.away_team?.color || "#EF4444";

  return (
    <div className="space-y-6">
      {/* Premier League Style Header with Team Logos */}
      <Card className="overflow-hidden">
        <div 
          className="h-2"
          style={{
            background: `linear-gradient(to right, ${homeTeamColor} 0%, ${homeTeamColor} 50%, ${awayTeamColor} 50%, ${awayTeamColor} 100%)`
          }}
        />
        <CardContent className="pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            {/* Home Team */}
            <div className="flex flex-col items-center min-w-[140px]">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={homeTeamColor}
                size="lg"
                showName={true}
              />
              <div className="text-5xl font-bold mt-3 mb-1" style={{ color: homeTeamColor }}>
                {fixture.home_score || 0}
              </div>
            </div>
            
            {/* Match Status */}
            <div className="flex flex-col items-center px-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <Badge variant="outline" className="text-lg px-4 py-1 font-semibold">
                  FULL TIME
                </Badge>
              </div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-gray-300 to-gray-600"></div>
              <div className="text-sm text-muted-foreground mt-2 text-center">
                {fixture.match_date}
              </div>
            </div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center min-w-[140px]">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={awayTeamColor}
                size="lg"
                showName={true}
              />
              <div className="text-5xl font-bold mt-3 mb-1" style={{ color: awayTeamColor }}>
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Section - Enhanced Chronological Display */}
      {chronologicalGoals.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Goals ({chronologicalGoals.length})
            </h3>
            
            <div className="flex justify-between items-start">
              {/* Home Team Goals */}
              <div className="flex-1 pr-4">
                <div className="space-y-3">
                  {homeGoals.map((goal, index) => (
                    <div key={`home-goal-${goal.id}-${index}`} className="text-left">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: homeTeamColor }}
                        />
                        <span className="font-semibold">{goal.playerName}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatMatchTime(goal.time)}
                        </Badge>
                      </div>
                      {goal.assistPlayerName && (
                        <div className="text-sm text-muted-foreground ml-5 mt-1">
                          Assist: {goal.assistPlayerName}
                        </div>
                      )}
                    </div>
                  ))}
                  {homeGoals.length === 0 && (
                    <div className="text-sm text-muted-foreground italic">No goals scored</div>
                  )}
                </div>
              </div>

              {/* Center Divider */}
              <div className="px-4">
                <div className="w-px h-full bg-border min-h-[60px]"></div>
              </div>

              {/* Away Team Goals */}
              <div className="flex-1 pl-4">
                <div className="space-y-3">
                  {awayGoals.map((goal, index) => (
                    <div key={`away-goal-${goal.id}-${index}`} className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Badge variant="outline" className="text-xs">
                          {formatMatchTime(goal.time)}
                        </Badge>
                        <span className="font-semibold">{goal.playerName}</span>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: awayTeamColor }}
                        />
                      </div>
                      {goal.assistPlayerName && (
                        <div className="text-sm text-muted-foreground mr-5 mt-1">
                          Assist: {goal.assistPlayerName}
                        </div>
                      )}
                    </div>
                  ))}
                  {awayGoals.length === 0 && (
                    <div className="text-sm text-muted-foreground italic">No goals scored</div>
                  )}
                </div>
              </div>
            </div>
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
                  <div className="flex-1 pr-4">
                    <div className="space-y-2">
                      {homeCards.map((card, index) => (
                        <div key={`home-card-${card.id}-${index}`} className="text-left">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: homeTeamColor }}
                            />
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
                  <div className="flex-1 pl-4">
                    <div className="space-y-2">
                      {awayCards.map((card, index) => (
                        <div key={`away-card-${card.id}-${index}`} className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-sm text-muted-foreground">{formatMatchTime(getCardTime(card))}</span>
                            <span className="font-medium">{getCardPlayerName(card)}</span>
                            <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="text-xs">
                              {getCardType(card)}
                            </Badge>
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: awayTeamColor }}
                            />
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

      {/* Enhanced Match Details */}
      <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Match Details</span>
            {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2">
            <EnhancedMatchDetails 
              fixture={fixture}
              timelineEvents={timelineEvents}
              formatTime={formatTime}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Match Statistics Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-bold text-xl" style={{ color: homeTeamColor }}>
              {homeGoals.length}
            </div>
            <div className="text-muted-foreground">Goals</div>
          </div>
          <div>
            <div className="font-bold text-xl text-gray-600">{cards.length}</div>
            <div className="text-muted-foreground">Cards</div>
          </div>
          <div>
            <div className="font-bold text-xl" style={{ color: awayTeamColor }}>
              {awayGoals.length}
            </div>
            <div className="text-muted-foreground">Goals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremierLeagueStyleSummary;
