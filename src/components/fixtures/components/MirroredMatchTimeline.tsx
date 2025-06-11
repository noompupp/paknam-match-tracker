
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
  teamId: string;
  isOwnGoal?: boolean;
  cardType?: string;
}

interface MirroredMatchTimelineProps {
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

const MirroredMatchTimeline = ({
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
}: MirroredMatchTimelineProps) => {
  // Create unified timeline events
  const allEvents: TimelineEvent[] = [
    ...goals.map(goal => ({
      id: goal.id,
      type: goal.type === 'assist' ? 'assist' as const : 'goal' as const,
      time: getGoalTime(goal),
      playerName: getGoalPlayerName(goal),
      teamName: goal.team_id === fixture.home_team_id ? fixture.home_team?.name : fixture.away_team?.name,
      teamColor: goal.team_id === fixture.home_team_id ? homeTeamColor : awayTeamColor,
      teamId: goal.team_id,
      isOwnGoal: goal.isOwnGoal || false
    })),
    ...cards.map(card => ({
      id: card.id,
      type: isCardRed(card) ? 'red_card' as const : 'yellow_card' as const,
      time: getCardTime(card),
      playerName: getCardPlayerName(card),
      teamName: card.team_id === fixture.home_team_id ? fixture.home_team?.name : fixture.away_team?.name,
      teamColor: card.team_id === fixture.home_team_id ? homeTeamColor : awayTeamColor,
      teamId: card.team_id,
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
        return 'Yellow';
      case 'red_card':
        return 'Red';
      default:
        return event.type;
    }
  };

  const TimelineEventCard = ({ event, isHome }: { event: TimelineEvent; isHome: boolean }) => (
    <div className="animate-fade-in">
      <div 
        className={`p-3 rounded-lg border-2 bg-muted/20 ${
          isHome ? 'border-l-4 border-r-0' : 'border-r-4 border-l-0'
        }`}
        style={{ 
          borderLeftColor: isHome ? event.teamColor : 'transparent',
          borderRightColor: isHome ? 'transparent' : event.teamColor
        }}
      >
        <div className={`flex items-center gap-2 ${isHome ? 'justify-start' : 'justify-end'}`}>
          {isHome && getEventIcon(event)}
          {isHome && (
            <Badge variant={getEventBadgeVariant(event)} className="text-xs">
              {getEventLabel(event)}
            </Badge>
          )}
          <span className="font-medium text-foreground">
            {event.playerName}
          </span>
          {!isHome && (
            <Badge variant={getEventBadgeVariant(event)} className="text-xs">
              {getEventLabel(event)}
            </Badge>
          )}
          {!isHome && getEventIcon(event)}
        </div>
        {event.isOwnGoal && (
          <div className={`text-xs text-red-600 font-medium mt-1 ${
            isHome ? 'text-left' : 'text-right'
          }`}>
            (Own Goal)
          </div>
        )}
      </div>
    </div>
  );

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
          <h4 className="font-semibold flex items-center gap-2 justify-center">
            <Clock className="h-4 w-4" />
            Match Timeline ({allEvents.length} events)
          </h4>
          
          {/* Enhanced 3-Column Mirrored Layout */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Column Headers */}
            <div className="grid grid-cols-5 gap-4 pb-2 border-b">
              <div className="col-span-2 text-center font-medium text-sm" style={{ color: homeTeamColor }}>
                {fixture.home_team?.name}
              </div>
              <div className="col-span-1 text-center font-medium text-sm text-muted-foreground">
                Time
              </div>
              <div className="col-span-2 text-center font-medium text-sm" style={{ color: awayTeamColor }}>
                {fixture.away_team?.name}
              </div>
            </div>

            {/* Timeline Events - Row by Row */}
            {allEvents.map((event) => {
              const isHomeEvent = event.teamId === fixture.home_team_id;
              const isAwayEvent = event.teamId === fixture.away_team_id;

              return (
                <div key={`timeline-${event.type}-${event.id}`} className="grid grid-cols-5 gap-4 items-center">
                  {/* Home Team Event */}
                  <div className="col-span-2">
                    {isHomeEvent && (
                      <div className="flex justify-end">
                        <div className="w-full">
                          <TimelineEventCard event={event} isHome={true} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Center Time */}
                  <div className="col-span-1 flex justify-center">
                    <div className="flex items-center justify-center h-12 w-12 bg-primary/10 rounded-lg">
                      <span className="text-sm font-mono text-primary font-bold">
                        {Math.floor(event.time / 60)}'
                      </span>
                    </div>
                  </div>

                  {/* Away Team Event */}
                  <div className="col-span-2">
                    {isAwayEvent && (
                      <div className="flex justify-start">
                        <div className="w-full">
                          <TimelineEventCard event={event} isHome={false} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MirroredMatchTimeline;
