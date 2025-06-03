
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Trophy, Target, Timer, Users, AlertTriangle } from "lucide-react";
import { PlayerTime } from "@/types/database";

interface MatchSummaryProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  events: any[];
  goals: any[];
  cards: any[];
  trackedPlayers: PlayerTime[];
  allPlayers: any[]; // Add this prop
  onExportSummary: () => void;
  formatTime: (seconds: number) => string;
}

const MatchSummary = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  events,
  goals,
  cards,
  trackedPlayers,
  allPlayers, // Include this prop
  onExportSummary,
  formatTime
}: MatchSummaryProps) => {
  const getResult = () => {
    if (homeScore > awayScore) return 'Home Win';
    if (awayScore > homeScore) return 'Away Win';
    return 'Draw';
  };

  const getResultColor = () => {
    if (homeScore > awayScore) return 'text-green-600';
    if (awayScore > homeScore) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const homeGoals = goals.filter(g => 
    selectedFixtureData && 
    allPlayers.find(p => p.id.toString() === g.playerId)?.team === selectedFixtureData.home_team?.name
  );
  
  const awayGoals = goals.filter(g => 
    selectedFixtureData && 
    allPlayers.find(p => p.id.toString() === g.playerId)?.team === selectedFixtureData.away_team?.name
  );

  const homeCards = cards.filter(c => c.team === selectedFixtureData?.home_team?.name);
  const awayCards = cards.filter(c => c.team === selectedFixtureData?.away_team?.name);

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Match Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Result */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <div className="text-right">
              <p className="font-bold text-lg">{selectedFixtureData?.home_team?.name}</p>
              <p className="text-3xl font-bold">{homeScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">VS</p>
              <Badge variant="outline" className={getResultColor()}>
                {getResult()}
              </Badge>
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">{selectedFixtureData?.away_team?.name}</p>
              <p className="text-3xl font-bold">{awayScore}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4" />
              <span>Duration: {formatTime(matchTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{trackedPlayers.length} players tracked</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Goals Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals & Assists ({goals.length})
          </h4>
          
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No goals scored</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Goals */}
              <div>
                <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.home_team?.name}</h5>
                <div className="space-y-1">
                  {homeGoals.map((goal, index) => (
                    <div key={index} className="text-sm flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <Badge variant={goal.type === 'goal' ? 'default' : 'outline'} className="mr-2">
                          {goal.type}
                        </Badge>
                        <span>{goal.playerName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                    </div>
                  ))}
                  {homeGoals.length === 0 && (
                    <p className="text-xs text-muted-foreground">No goals</p>
                  )}
                </div>
              </div>

              {/* Away Goals */}
              <div>
                <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.away_team?.name}</h5>
                <div className="space-y-1">
                  {awayGoals.map((goal, index) => (
                    <div key={index} className="text-sm flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <Badge variant={goal.type === 'goal' ? 'default' : 'outline'} className="mr-2">
                          {goal.type}
                        </Badge>
                        <span>{goal.playerName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                    </div>
                  ))}
                  {awayGoals.length === 0 && (
                    <p className="text-xs text-muted-foreground">No goals</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Cards Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Cards ({cards.length})
          </h4>
          
          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No cards issued</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Cards */}
              <div>
                <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.home_team?.name}</h5>
                <div className="space-y-1">
                  {homeCards.map((card, index) => (
                    <div key={index} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <Badge variant={card.type === 'red' ? 'destructive' : 'outline'} className="mr-2">
                          {card.type}
                        </Badge>
                        <span>{card.player}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(card.time)}</span>
                    </div>
                  ))}
                  {homeCards.length === 0 && (
                    <p className="text-xs text-muted-foreground">No cards</p>
                  )}
                </div>
              </div>

              {/* Away Cards */}
              <div>
                <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.away_team?.name}</h5>
                <div className="space-y-1">
                  {awayCards.map((card, index) => (
                    <div key={index} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <Badge variant={card.type === 'red' ? 'destructive' : 'outline'} className="mr-2">
                          {card.type}
                        </Badge>
                        <span>{card.player}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(card.time)}</span>
                    </div>
                  ))}
                  {awayCards.length === 0 && (
                    <p className="text-xs text-muted-foreground">No cards</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Player Time Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Player Time Summary
          </h4>
          
          {trackedPlayers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No players tracked</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {trackedPlayers
                .sort((a, b) => b.totalTime - a.totalTime)
                .map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-muted-foreground ml-2">({player.team})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{formatTime(player.totalTime)}</span>
                      <Badge variant={player.isPlaying ? "default" : "secondary"} className="ml-2 text-xs">
                        {player.isPlaying ? "ON" : "OFF"}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Match Events Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold">Key Events ({events.length})</h4>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No events recorded</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {events.slice(-5).reverse().map((event) => (
                <div key={event.id} className="text-sm p-2 bg-muted/10 rounded">
                  <div className="flex items-center justify-between">
                    <span>{event.description}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(event.time)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        <Button onClick={onExportSummary} className="w-full" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Match Summary
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatchSummary;
