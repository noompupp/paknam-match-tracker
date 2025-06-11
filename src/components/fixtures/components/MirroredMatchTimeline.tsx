import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

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
  assistPlayerName?: string;
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
  const isMobile = useIsMobile();
  
  // Use processed events instead of re-processing raw data
  const homeGoals = processedEvents.homeGoals || [];
  const awayGoals = processedEvents.awayGoals || [];
  
  // Create unified timeline events using processed data
  const allEvents: TimelineEvent[] = [
    ...homeGoals.map((goal: any) => ({
      id: goal.id,
      type: goal.type === 'assist' ? 'assist' as const : 'goal' as const,
      time: getGoalTime(goal),
      playerName: getGoalPlayerName(goal),
      teamName: fixture.home_team?.name || 'Home Team',
      teamColor: homeTeamColor,
      teamId: fixture.home_team_id,
      isOwnGoal: goal.own_goal || goal.isOwnGoal || false,
      assistPlayerName: goal.assistPlayerName || goal.assist_player_name
    })),
    ...awayGoals.map((goal: any) => ({
      id: goal.id,
      type: goal.type === 'assist' ? 'assist' as const : 'goal' as const,
      time: getGoalTime(goal),
      playerName: getGoalPlayerName(goal),
      teamName: fixture.away_team?.name || 'Away Team',
      teamColor: awayTeamColor,
      teamId: fixture.away_team_id,
      isOwnGoal: goal.own_goal || goal.isOwnGoal || false,
      assistPlayerName: goal.assistPlayerName || goal.assist_player_name
    })),
    ...cards.map(card => {
      // Determine which team this card belongs to
      const isHomeTeamCard = card.team_id === fixture.home_team_id;
      return {
        id: card.id,
        type: isCardRed(card) ? 'red_card' as const : 'yellow_card' as const,
        time: getCardTime(card),
        playerName: getCardPlayerName(card),
        teamName: isHomeTeamCard ? fixture.home_team?.name : fixture.away_team?.name,
        teamColor: isHomeTeamCard ? homeTeamColor : awayTeamColor,
        teamId: card.team_id,
        cardType: getCardType(card)
      };
    })
  ].sort((a, b) => a.time - b.time);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'goal':
        return event.isOwnGoal ? '🔴' : '⚽';
      case 'assist':
        return '🎯';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      default:
        return '⚽';
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
        className={`
          ${isMobile ? 'p-2' : 'p-3'} 
          rounded-lg border-2 bg-muted/20 
          ${isHome ? 'border-l-4 border-r-0' : 'border-r-4 border-l-0'}
          transition-all duration-200 hover:bg-muted/30
        `}
        style={{ 
          borderLeftColor: isHome ? event.teamColor : 'transparent',
          borderRightColor: isHome ? 'transparent' : event.teamColor
        }}
      >
        <div className={`flex items-center gap-2 ${isHome ? 'justify-start' : 'justify-end'}`}>
          {isHome && (
            <span className={`${isMobile ? 'text-sm' : 'text-lg'}`} role="img" aria-label={getEventLabel(event)}>
              {getEventIcon(event)}
            </span>
          )}
          {isHome && (
            <Badge variant={getEventBadgeVariant(event)} className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}`}>
              {getEventLabel(event)}
            </Badge>
          )}
          <span className={`font-medium text-foreground ${isMobile ? 'text-sm' : ''}`}>
            {event.playerName}
          </span>
          {event.assistPlayerName && (
            <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
              (Assist: {event.assistPlayerName})
            </span>
          )}
          {!isHome && (
            <Badge variant={getEventBadgeVariant(event)} className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}`}>
              {getEventLabel(event)}
            </Badge>
          )}
          {!isHome && (
            <span className={`${isMobile ? 'text-sm' : 'text-lg'}`} role="img" aria-label={getEventLabel(event)}>
              {getEventIcon(event)}
            </span>
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
      <CardContent className={`${isMobile ? 'pt-4' : 'pt-6'}`}>
        <div className="space-y-4">
          <h4 className={`font-semibold flex items-center gap-2 justify-center ${isMobile ? 'text-base' : ''}`}>
            <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            Match Timeline ({allEvents.length} events)
          </h4>
          
          {/* Enhanced 3-Column Mirrored Layout with Mobile Optimizations */}
          <div className={`space-y-3 overflow-y-auto ${isMobile ? 'max-h-80' : 'max-h-96'}`}>
            {/* Column Headers */}
            <div className={`grid grid-cols-5 gap-4 pb-2 border-b ${isMobile ? 'gap-2' : ''}`}>
              <div className={`col-span-2 text-center font-medium ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: homeTeamColor }}>
                {isMobile ? (fixture.home_team?.name?.substring(0, 8) || 'Home') : fixture.home_team?.name}
              </div>
              <div className={`col-span-1 text-center font-medium text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Time
              </div>
              <div className={`col-span-2 text-center font-medium ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: awayTeamColor }}>
                {isMobile ? (fixture.away_team?.name?.substring(0, 8) || 'Away') : fixture.away_team?.name}
              </div>
            </div>

            {/* Timeline Events - Row by Row with Mobile Spacing */}
            {allEvents.map((event) => {
              const isHomeEvent = event.teamId === fixture.home_team_id;
              const isAwayEvent = event.teamId === fixture.away_team_id;

              return (
                <div key={`timeline-${event.type}-${event.id}`} className={`grid grid-cols-5 items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
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

                  {/* Center Time - Mobile Optimized */}
                  <div className="col-span-1 flex justify-center">
                    <div className={`
                      flex items-center justify-center bg-primary/10 rounded-lg
                      ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}
                    `}>
                      <span className={`font-mono text-primary font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>
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
