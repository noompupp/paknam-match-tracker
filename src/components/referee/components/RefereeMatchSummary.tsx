
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, Clock, Trophy } from "lucide-react";

interface RefereeMatchSummaryProps {
  goals: any[];
  cards: any[];
  events: any[];
  trackedPlayers: any[];
  selectedFixtureData: any;
  formatTime: (seconds: number) => string;
}

const RefereeMatchSummary = ({
  goals,
  cards,
  events,
  trackedPlayers,
  selectedFixtureData,
  formatTime
}: RefereeMatchSummaryProps) => {
  const yellowCards = cards.filter(card => card.type === 'yellow');
  const redCards = cards.filter(card => card.type === 'red');

  return (
    <div className="space-y-4">
      {/* Match Overview */}
      <Card className="referee-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Match Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{goals.filter(g => g.team === 'home').length}</div>
              <p className="text-xs text-muted-foreground">Goals</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{goals.filter(g => g.team === 'away').length}</div>
              <p className="text-xs text-muted-foreground">Goals</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="text-lg font-semibold">{goals.length}</div>
              <p className="text-xs text-muted-foreground">Total Goals</p>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold">{yellowCards.length}</div>
              <p className="text-xs text-muted-foreground">Yellow Cards</p>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold">{redCards.length}</div>
              <p className="text-xs text-muted-foreground">Red Cards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Summary */}
      {goals.length > 0 && (
        <Card className="referee-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals ({goals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {goals.slice(0, 5).map((goal, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatTime(goal.time)}
                    </Badge>
                    <span className="font-medium">{goal.player}</span>
                  </div>
                  <Badge variant={goal.team === 'home' ? 'default' : 'secondary'}>
                    {goal.team}
                  </Badge>
                </div>
              ))}
              {goals.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{goals.length - 5} more goals
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards Summary */}
      {cards.length > 0 && (
        <Card className="referee-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Cards ({cards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cards.slice(0, 5).map((card, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatTime(card.time)}
                    </Badge>
                    <span className="font-medium">{card.player}</span>
                  </div>
                  <Badge variant={card.type === 'yellow' ? 'outline' : 'destructive'}>
                    {card.type}
                  </Badge>
                </div>
              ))}
              {cards.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{cards.length - 5} more cards
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Time Summary */}
      {trackedPlayers.length > 0 && (
        <Card className="referee-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Playing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trackedPlayers.slice(0, 3).map((player) => (
                <div key={player.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{player.name}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatTime(player.totalTime)}
                  </Badge>
                </div>
              ))}
              {trackedPlayers.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{trackedPlayers.length - 3} more players
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RefereeMatchSummary;
