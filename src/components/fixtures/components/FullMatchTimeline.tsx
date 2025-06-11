
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineEvent {
  id: string | number;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card';
  time: number;
  playerName: string;
  teamName: string;
  teamColor: string;
  isOwnGoal?: boolean;
  cardType?: string;
}

interface FullMatchTimelineProps {
  goals: any[];
  cards: any[];
  processedEvents: any;
  homeTeamColor: string;
  awayTeamColor: string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
  fixture: any;
}

const FullMatchTimeline = ({
  goals,
  cards,
  processedEvents,
  homeTeamColor,
  awayTeamColor,
  getGoalPlayerName,
  getGoalTime,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed,
  fixture
}: FullMatchTimelineProps) => {
  // Combine all events into a timeline
  const allEvents: TimelineEvent[] = [
    ...goals.map(goal => ({
      id: goal.id,
      type: goal.type === 'assist' ? 'assist' as const : 'goal' as const,
      time: getGoalTime(goal),
      playerName: getGoalPlayerName(goal),
      teamName: goal.team_id === fixture.home_team_id ? fixture.home_team?.name : fixture.away_team?.name,
      teamColor: goal.team_id === fixture.home_team_id ? homeTeamColor : awayTeamColor,
      isOwnGoal: goal.isOwnGoal || false
    })),
    ...cards.map(card => ({
      id: card.id,
      type: isCardRed(card) ? 'red_card' as const : 'yellow_card' as const,
      time: getCardTime(card),
      playerName: getCardPlayerName(card),
      teamName: card.team_id === fixture.home_team_id ? fixture.home_team?.name : fixture.away_team?.name,
      teamColor: card.team_id === fixture.home_team_id ? homeTeamColor : awayTeamColor,
      cardType: getCardType(card)
    }))
  ].sort((a, b) => a.time - b.time);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'goal':
        return event.isOwnGoal ? 
          <Target className="h-4 w-4 text-red-500" /> : 
          <Target className="h-4 w-4 text-green-500" />;
      case 'assist':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'yellow_card':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'red_card':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventBadgeVariant = (event: TimelineEvent) => {
    switch (event.type) {
      case 'goal':
        return event.isOwnGoal ? 'destructive' : 'default';
      case 'assist':
        return 'secondary';
      case 'yellow_card':
        return 'outline';
      case 'red_card':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getEventLabel = (event: TimelineEvent) => {
    switch (event.type) {
      case 'goal':
        return event.isOwnGoal ? 'Own Goal' : 'Goal';
      case 'assist':
        return 'Assist';
      case 'yellow_card':
        return 'Yellow Card';
      case 'red_card':
        return 'Red Card';
      default:
        return event.type;
    }
  };

  if (allEvents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No match events recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Full Match Timeline ({allEvents.length} events)
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allEvents.map((event) => (
              <div 
                key={`${event.type}-${event.id}`} 
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border-l-4"
                style={{ borderLeftColor: event.teamColor }}
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {event.playerName}
                      </span>
                      <Badge variant={getEventBadgeVariant(event)} className="text-xs">
                        {getEventLabel(event)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.teamName}
                      {event.isOwnGoal && (
                        <span className="ml-2 text-red-600 font-medium">(Own Goal)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono text-muted-foreground">
                    {Math.floor(event.time / 60)}'
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FullMatchTimeline;
