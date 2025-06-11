
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
  // Create timeline events for both teams
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

  // Separate events by team
  const homeEvents = allEvents.filter(event => event.teamId === fixture.home_team_id);
  const awayEvents = allEvents.filter(event => event.teamId === fixture.away_team_id);

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
        className={`p-3 rounded-lg border-l-4 bg-muted/20 ${
          isHome ? 'text-left' : 'text-right'
        }`}
        style={{ borderLeftColor: isHome ? undefined : 'transparent', borderRightColor: isHome ? 'transparent' : event.teamColor }}
      >
        <div className={`flex items-center gap-2 ${isHome ? 'justify-start' : 'justify-end'}`}>
          {!isHome && (
            <Badge variant={getEventBadgeVariant(event)} className="text-xs">
              {getEventLabel(event)}
            </Badge>
          )}
          {!isHome && getEventIcon(event)}
          <span className="font-medium text-foreground">
            {event.playerName}
          </span>
          {isHome && getEventIcon(event)}
          {isHome && (
            <Badge variant={getEventBadgeVariant(event)} className="text-xs">
              {getEventLabel(event)}
            </Badge>
          )}
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
          
          {/* 3-Column Mirrored Layout */}
          <div className="grid grid-cols-5 gap-4 max-h-96 overflow-y-auto">
            {/* Home Team Events (Left Column) */}
            <div className="col-span-2 space-y-3">
              <div className="text-center font-medium text-sm pb-2 border-b" style={{ color: homeTeamColor }}>
                {fixture.home_team?.name}
              </div>
              {homeEvents.map((event) => (
                <div key={`home-${event.type}-${event.id}`} className="flex justify-end">
                  <div className="w-full">
                    <TimelineEventCard event={event} isHome={true} />
                  </div>
                </div>
              ))}
            </div>

            {/* Center Timeline (Time Column) */}
            <div className="col-span-1 flex flex-col items-center space-y-3">
              <div className="text-center font-medium text-sm pb-2 border-b text-muted-foreground">
                Time
              </div>
              {allEvents.map((event) => (
                <div 
                  key={`time-${event.type}-${event.id}`} 
                  className="flex items-center justify-center h-16 w-12 bg-primary/10 rounded-lg"
                >
                  <span className="text-sm font-mono text-primary font-bold">
                    {Math.floor(event.time / 60)}'
                  </span>
                </div>
              ))}
            </div>

            {/* Away Team Events (Right Column) */}
            <div className="col-span-2 space-y-3">
              <div className="text-center font-medium text-sm pb-2 border-b" style={{ color: awayTeamColor }}>
                {fixture.away_team?.name}
              </div>
              {awayEvents.map((event) => (
                <div key={`away-${event.type}-${event.id}`} className="flex justify-start">
                  <div className="w-full">
                    <TimelineEventCard event={event} isHome={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MirroredMatchTimeline;
