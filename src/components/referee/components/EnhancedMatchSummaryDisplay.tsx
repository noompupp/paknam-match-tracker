
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Trophy, Target } from "lucide-react";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface EnhancedMatchSummaryDisplayProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  goals: any[];
  cards: any[];
  trackedPlayers: any[];
  allPlayers: ComponentPlayer[];
  formatTime: (seconds: number) => string;
}

const EnhancedMatchSummaryDisplay = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  goals,
  cards,
  trackedPlayers,
  allPlayers,
  formatTime
}: EnhancedMatchSummaryDisplayProps) => {
  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No match selected</p>
        </CardContent>
      </Card>
    );
  }

  // Enhanced deduplication with more comprehensive unique key generation
  const createUniqueKey = (item: any, type: string) => {
    return `${type}-${item.playerId || item.player_id}-${item.time}-${item.type || item.card_type}-${item.team}`;
  };

  // Deduplicate goals with enhanced logic
  const uniqueGoals = goals.filter((goal, index, self) => {
    const currentKey = createUniqueKey(goal, 'goal');
    return index === self.findIndex(g => createUniqueKey(g, 'goal') === currentKey);
  });

  // Deduplicate cards with enhanced logic
  const uniqueCards = cards.filter((card, index, self) => {
    const currentKey = createUniqueKey(card, 'card');
    return index === self.findIndex(c => createUniqueKey(c, 'card') === currentKey);
  });

  console.log('🔍 Enhanced deduplication results:', {
    originalGoals: goals.length,
    uniqueGoals: uniqueGoals.length,
    originalCards: cards.length,
    uniqueCards: uniqueCards.length
  });

  const homeTeam = selectedFixtureData.home_team?.name || 'Home Team';
  const awayTeam = selectedFixtureData.away_team?.name || 'Away Team';

  const homeGoals = uniqueGoals.filter(goal => goal.team === homeTeam && goal.type === 'goal');
  const awayGoals = uniqueGoals.filter(goal => goal.team === awayTeam && goal.type === 'goal');
  const assists = uniqueGoals.filter(goal => goal.type === 'assist');

  const homeCards = uniqueCards.filter(card => card.team === homeTeam);
  const awayCards = uniqueCards.filter(card => card.team === awayTeam);

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Match Summary
            </span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono">{formatTime(matchTime)}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{homeTeam}</h3>
                <div className="text-3xl font-bold text-primary">{homeScore}</div>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{awayTeam}</h3>
                <div className="text-3xl font-bold text-primary">{awayScore}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Summary */}
      {uniqueGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals & Assists ({uniqueGoals.length})
              <Badge variant="outline" className="ml-auto text-xs">
                Deduplicated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Team Goals */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">{homeTeam}</h4>
                <div className="space-y-2">
                  {homeGoals.map((goal, index) => (
                    <div key={`home-goal-${index}-${goal.playerId}-${goal.time}`} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="font-medium">{goal.playerName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Goal
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTime(goal.time)}</span>
                      </div>
                    </div>
                  ))}
                  {assists.filter(assist => assist.team === homeTeam).map((assist, index) => (
                    <div key={`home-assist-${index}-${assist.playerId}-${assist.time}`} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <span className="font-medium">{assist.playerName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Assist
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTime(assist.time)}</span>
                      </div>
                    </div>
                  ))}
                  {homeGoals.length === 0 && assists.filter(assist => assist.team === homeTeam).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No goals or assists</p>
                  )}
                </div>
              </div>

              {/* Away Team Goals */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">{awayTeam}</h4>
                <div className="space-y-2">
                  {awayGoals.map((goal, index) => (
                    <div key={`away-goal-${index}-${goal.playerId}-${goal.time}`} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="font-medium">{goal.playerName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Goal
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTime(goal.time)}</span>
                      </div>
                    </div>
                  ))}
                  {assists.filter(assist => assist.team === awayTeam).map((assist, index) => (
                    <div key={`away-assist-${index}-${assist.playerId}-${assist.time}`} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <span className="font-medium">{assist.playerName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Assist
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTime(assist.time)}</span>
                      </div>
                    </div>
                  ))}
                  {awayGoals.length === 0 && assists.filter(assist => assist.team === awayTeam).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No goals or assists</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards Summary */}
      {uniqueCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Disciplinary Actions ({uniqueCards.length})
              <Badge variant="outline" className="ml-auto text-xs">
                Deduplicated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">{homeTeam}</h4>
                <div className="space-y-2">
                  {homeCards.map((card, index) => (
                    <div key={`home-card-${index}-${card.playerId || card.player_id}-${card.time}`} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <span className="font-medium">{card.playerName || card.player_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={card.type === 'yellow' || card.card_type === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {(card.type || card.card_type) === 'yellow' ? 'Yellow' : 'Red'} Card
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTime(card.time)}</span>
                      </div>
                    </div>
                  ))}
                  {homeCards.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No cards issued</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">{awayTeam}</h4>
                <div className="space-y-2">
                  {awayCards.map((card, index) => (
                    <div key={`away-card-${index}-${card.playerId || card.player_id}-${card.time}`} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <span className="font-medium">{card.playerName || card.player_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={card.type === 'yellow' || card.card_type === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {(card.type || card.card_type) === 'yellow' ? 'Yellow' : 'Red'} Card
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTime(card.time)}</span>
                      </div>
                    </div>
                  ))}
                  {awayCards.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No cards issued</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Time Tracking */}
      {trackedPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Player Time Tracking ({trackedPlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trackedPlayers.map((player, index) => (
                <div key={`tracked-player-${index}-${player.id}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({player.team})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={player.isPlaying ? "default" : "secondary"}>
                      {player.isPlaying ? 'Playing' : 'Not Playing'}
                    </Badge>
                    <span className="text-sm font-mono">{formatTime(player.totalTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMatchSummaryDisplay;
