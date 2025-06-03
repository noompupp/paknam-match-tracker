
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Trophy, Target, Timer, Users, AlertTriangle, TrendingUp, Award } from "lucide-react";
import { PlayerTime } from "@/types/database";

interface EnhancedMatchSummaryProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  events: any[];
  goals: any[];
  cards: any[];
  trackedPlayers: PlayerTime[];
  allPlayers: any[];
  onExportSummary: () => void;
  formatTime: (seconds: number) => string;
}

const EnhancedMatchSummary = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  events,
  goals,
  cards,
  trackedPlayers,
  allPlayers,
  onExportSummary,
  formatTime
}: EnhancedMatchSummaryProps) => {
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

  // Calculate key statistics
  const keyStats = {
    totalEvents: events.length,
    totalGoals: goals.length,
    totalCards: cards.length,
    totalPlaytime: trackedPlayers.reduce((sum, p) => sum + p.totalTime, 0),
    averagePlaytime: trackedPlayers.length > 0 ? 
      Math.round((trackedPlayers.reduce((sum, p) => sum + p.totalTime, 0) / trackedPlayers.length) / 60 * 100) / 100 : 0,
    topPlayer: trackedPlayers.length > 0 ? 
      trackedPlayers.reduce((max, player) => player.totalTime > max.totalTime ? player : max) : null
  };

  const getPlayerRole = (playerId: number) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player?.position || 'Player';
  };

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Enhanced Match Summary
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

        {/* Key Statistics Dashboard */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Key Statistics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{keyStats.totalEvents}</p>
              <p className="text-xs text-blue-800">Total Events</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{keyStats.totalGoals}</p>
              <p className="text-xs text-green-800">Goals & Assists</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{keyStats.totalCards}</p>
              <p className="text-xs text-yellow-800">Cards Issued</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">{keyStats.averagePlaytime}m</p>
              <p className="text-xs text-purple-800">Avg. Playtime</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Goals & Assists Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals & Assists ({goals.length})
          </h4>
          
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No goals or assists recorded</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Goals */}
              <div>
                <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.home_team?.name}</h5>
                <div className="space-y-1">
                  {homeGoals.map((goal, index) => (
                    <div key={index} className="text-sm flex items-center justify-between p-2 bg-green-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={goal.type === 'goal' ? 'default' : 'outline'} className="text-xs">
                          {goal.type}
                        </Badge>
                        <span className="font-medium">{goal.playerName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getPlayerRole(parseInt(goal.playerId))}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                    </div>
                  ))}
                  {homeGoals.length === 0 && (
                    <p className="text-xs text-muted-foreground">No goals or assists</p>
                  )}
                </div>
              </div>

              {/* Away Goals */}
              <div>
                <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.away_team?.name}</h5>
                <div className="space-y-1">
                  {awayGoals.map((goal, index) => (
                    <div key={index} className="text-sm flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={goal.type === 'goal' ? 'default' : 'outline'} className="text-xs">
                          {goal.type}
                        </Badge>
                        <span className="font-medium">{goal.playerName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getPlayerRole(parseInt(goal.playerId))}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                    </div>
                  ))}
                  {awayGoals.length === 0 && (
                    <p className="text-xs text-muted-foreground">No goals or assists</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Player Performance Highlights */}
        {keyStats.topPlayer && (
          <>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Award className="h-4 w-4" />
                Player Performance Highlights
              </h4>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Most Active Player</p>
                    <p className="text-lg font-bold text-orange-600">{keyStats.topPlayer.name}</p>
                    <p className="text-sm text-muted-foreground">{keyStats.topPlayer.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{formatTime(keyStats.topPlayer.totalTime)}</p>
                    <p className="text-sm text-muted-foreground">Playing Time</p>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Cards Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Disciplinary Actions ({cards.length})
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
                      <div className="flex items-center gap-2">
                        <Badge variant={card.type === 'red' ? 'destructive' : 'outline'}>
                          {card.type}
                        </Badge>
                        <span className="font-medium">{card.player}</span>
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
                      <div className="flex items-center gap-2">
                        <Badge variant={card.type === 'red' ? 'destructive' : 'outline'}>
                          {card.type}
                        </Badge>
                        <span className="font-medium">{card.player}</span>
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
            Player Time Summary ({trackedPlayers.length} players)
          </h4>
          
          {trackedPlayers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No players tracked</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trackedPlayers
                .sort((a, b) => b.totalTime - a.totalTime)
                .map((player) => {
                  const role = getPlayerRole(player.id);
                  const playTimePercent = Math.round((player.totalTime / matchTime) * 100);
                  return (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-muted/20 rounded text-sm border">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-medium">{player.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-muted-foreground text-xs">({player.team})</span>
                            <Badge variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{formatTime(player.totalTime)}</span>
                          <Badge variant={player.isPlaying ? "default" : "secondary"} className="text-xs">
                            {player.isPlaying ? "ON" : "OFF"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{playTimePercent}% of match</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <Separator />

        {/* Match Events Timeline */}
        <div className="space-y-3">
          <h4 className="font-semibold">Match Events Timeline ({events.length})</h4>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No events recorded</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {events.slice(-8).reverse().map((event) => (
                <div key={event.id} className="text-sm p-3 bg-muted/10 rounded border-l-4 border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{event.description}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">{formatTime(event.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {events.length > 8 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing last 8 events of {events.length} total
                </p>
              )}
            </div>
          )}
        </div>

        {/* Export Button */}
        <Button onClick={onExportSummary} className="w-full" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Enhanced Match Summary
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedMatchSummary;
