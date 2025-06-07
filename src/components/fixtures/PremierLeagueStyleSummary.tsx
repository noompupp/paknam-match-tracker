
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

  const formatMatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  // Process goals from timeline events for enhanced display
  const timelineGoals = timelineEvents.filter(event => event.type === 'goal');
  
  // Group goals by team for display
  const homeGoals = timelineGoals.filter(goal => 
    getGoalTeamId(goal) === fixture?.home_team_id
  );
  const awayGoals = timelineGoals.filter(goal => 
    getGoalTeamId(goal) === fixture?.away_team_id
  );

  // Get cards for each team
  const homeCards = cards.filter(c => getCardTeamId(c) === fixture?.home_team_id);
  const awayCards = cards.filter(c => getCardTeamId(c) === fixture?.away_team_id);

  const hasCards = cards.length > 0;

  // Enhanced team colors with better defaults
  const homeTeamColor = fixture.home_team?.color || "#1f2937"; // Dark gray default
  const awayTeamColor = fixture.away_team?.color || "#7c3aed"; // Purple default

  return (
    <div className="space-y-6">
      {/* Premier League Style Header with Enhanced Team Logos */}
      <Card className="overflow-hidden">
        <div 
          className="h-3"
          style={{
            background: `linear-gradient(to right, ${homeTeamColor} 0%, ${homeTeamColor} 50%, ${awayTeamColor} 50%, ${awayTeamColor} 100%)`
          }}
        />
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center justify-between mb-8">
            {/* Home Team - Enhanced Logo Display */}
            <div className="flex flex-col items-center min-w-[160px]">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home Team'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={homeTeamColor}
                size="lg"
                showName={true}
              />
              <div className="text-6xl font-bold mt-4 mb-2" style={{ color: homeTeamColor }}>
                {fixture.home_score || 0}
              </div>
            </div>
            
            {/* Enhanced Match Status Display */}
            <div className="flex flex-col items-center px-8 min-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <Badge variant="outline" className="text-xl px-6 py-2 font-bold bg-gradient-to-r from-blue-50 to-green-50">
                  {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
                </Badge>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-600 rounded-full"></div>
              <div className="text-sm text-muted-foreground mt-3 text-center font-medium">
                {fixture.match_date}
              </div>
              {fixture.venue && (
                <div className="text-xs text-muted-foreground text-center mt-1">
                  📍 {fixture.venue}
                </div>
              )}
            </div>
            
            {/* Away Team - Enhanced Logo Display */}
            <div className="flex flex-col items-center min-w-[160px]">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away Team'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={awayTeamColor}
                size="lg"
                showName={true}
              />
              <div className="text-6xl font-bold mt-4 mb-2" style={{ color: awayTeamColor }}>
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Goals Section */}
      {timelineGoals.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Goals ({timelineGoals.length})
            </h3>
            
            <div className="flex justify-between items-start">
              {/* Home Team Goals */}
              <div className="flex-1 pr-6">
                <div className="space-y-4">
                  {homeGoals.map((goal, index) => (
                    <div key={`home-goal-${goal.id}-${index}`} className="text-left">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-md"
                          style={{ backgroundColor: homeTeamColor }}
                        />
                        <span className="font-semibold text-base">{getGoalPlayerName(goal)}</span>
                        <Badge variant="outline" className="text-sm font-medium">
                          {formatMatchTime(getGoalTime(goal))}
                        </Badge>
                      </div>
                      {goal.assistPlayerName && (
                        <div className="text-sm text-muted-foreground ml-6 mt-2 font-medium">
                          🅰️ Assist: {goal.assistPlayerName}
                        </div>
                      )}
                    </div>
                  ))}
                  {homeGoals.length === 0 && (
                    <div className="text-sm text-muted-foreground italic text-center py-4">No goals scored</div>
                  )}
                </div>
              </div>

              {/* Enhanced Center Divider */}
              <div className="px-6">
                <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 min-h-[80px] rounded-full"></div>
              </div>

              {/* Away Team Goals */}
              <div className="flex-1 pl-6">
                <div className="space-y-4">
                  {awayGoals.map((goal, index) => (
                    <div key={`away-goal-${goal.id}-${index}`} className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Badge variant="outline" className="text-sm font-medium">
                          {formatMatchTime(getGoalTime(goal))}
                        </Badge>
                        <span className="font-semibold text-base">{getGoalPlayerName(goal)}</span>
                        <div 
                          className="w-3 h-3 rounded-full shadow-md"
                          style={{ backgroundColor: awayTeamColor }}
                        />
                      </div>
                      {goal.assistPlayerName && (
                        <div className="text-sm text-muted-foreground mr-6 mt-2 font-medium">
                          🅰️ Assist: {goal.assistPlayerName}
                        </div>
                      )}
                    </div>
                  ))}
                  {awayGoals.length === 0 && (
                    <div className="text-sm text-muted-foreground italic text-center py-4">No goals scored</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Collapsible Cards Section */}
      {hasCards && (
        <Collapsible open={cardsExpanded} onOpenChange={setCardsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between hover:bg-muted/50">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Disciplinary ({cards.length})
              </span>
              {cardsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  {/* Home Team Cards */}
                  <div className="flex-1 pr-4">
                    <div className="space-y-3">
                      {homeCards.map((card, index) => (
                        <div key={`home-card-${card.id}-${index}`} className="text-left">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: homeTeamColor }}
                            />
                            <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="text-sm">
                              {getCardType(card)}
                            </Badge>
                            <span className="font-medium">{getCardPlayerName(card)}</span>
                            <span className="text-sm text-muted-foreground font-mono">
                              {formatMatchTime(getCardTime(card))}
                            </span>
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
                    <div className="w-px h-full bg-border min-h-[30px]"></div>
                  </div>

                  {/* Away Team Cards */}
                  <div className="flex-1 pl-4">
                    <div className="space-y-3">
                      {awayCards.map((card, index) => (
                        <div key={`away-card-${card.id}-${index}`} className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-sm text-muted-foreground font-mono">
                              {formatMatchTime(getCardTime(card))}
                            </span>
                            <span className="font-medium">{getCardPlayerName(card)}</span>
                            <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="text-sm">
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
          <Button variant="outline" className="w-full justify-between hover:bg-muted/50">
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

      {/* Enhanced Match Statistics Footer */}
      <div className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 rounded-xl p-6 border">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="font-bold text-2xl mb-1" style={{ color: homeTeamColor }}>
              {homeGoals.length}
            </div>
            <div className="text-muted-foreground text-sm font-medium">Goals</div>
            <div className="text-xs text-muted-foreground mt-1">
              {fixture.home_team?.name}
            </div>
          </div>
          <div>
            <div className="font-bold text-2xl mb-1 text-amber-600">{cards.length}</div>
            <div className="text-muted-foreground text-sm font-medium">Total Cards</div>
            <div className="text-xs text-muted-foreground mt-1">
              {timelineEvents.length} Events
            </div>
          </div>
          <div>
            <div className="font-bold text-2xl mb-1" style={{ color: awayTeamColor }}>
              {awayGoals.length}
            </div>
            <div className="text-muted-foreground text-sm font-medium">Goals</div>
            <div className="text-xs text-muted-foreground mt-1">
              {fixture.away_team?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremierLeagueStyleSummary;
