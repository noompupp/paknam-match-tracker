
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Goal, UserX, Clock } from "lucide-react";
import { getGoalAssistPlayerName } from "../utils/matchSummaryDataProcessor";

interface MatchEventsSectionProps {
  goals: any[];
  cards: any[];
  timelineEvents?: any[];
  processedEvents: {
    homeGoals: any[];
    awayGoals: any[];
  };
  homeTeamColor: string;
  awayTeamColor: string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
  fixture: any;
  formatTime?: (seconds: number) => string;
}

const MatchEventsSection = ({
  goals,
  cards,
  timelineEvents = [],
  processedEvents,
  homeTeamColor,
  awayTeamColor,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed,
  fixture,
  formatTime
}: MatchEventsSectionProps) => {
  
  const defaultFormatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  const timeFormatter = formatTime || defaultFormatTime;

  // Combine all events from different sources
  const combinedEvents = [
    // Goals from props
    ...goals.map(goal => ({
      type: 'goal',
      time: getGoalTime(goal),
      data: goal,
      isHome: processedEvents.homeGoals.includes(goal),
      source: 'props'
    })),
    // Cards from props
    ...cards.map(card => ({
      type: 'card',
      time: getCardTime(card),
      data: card,
      isHome: getCardTeamId(card) === fixture?.home_team_id,
      source: 'props'
    })),
    // Timeline events (if provided)
    ...timelineEvents.map(event => ({
      type: event.type || 'event',
      time: event.time,
      data: event,
      isHome: event.teamId === fixture?.home_team_id,
      source: 'timeline'
    }))
  ];

  // Remove duplicates and sort by time
  const uniqueEvents = combinedEvents
    .filter((event, index, arr) => {
      // Remove duplicates based on type, time, and player/team data
      const key = `${event.type}-${event.time}-${event.data.id || event.data.playerName}`;
      return arr.findIndex(e => `${e.type}-${e.time}-${e.data.id || e.data.playerName}` === key) === index;
    })
    .sort((a, b) => a.time - b.time);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Goal className="h-4 w-4 text-green-600" />;
      case 'card':
      case 'yellow_card':
      case 'red_card':
        return <UserX className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventEmoji = (eventType: string, isRed?: boolean) => {
    switch (eventType) {
      case 'goal':
        return '⚽';
      case 'card':
        return isRed ? '🟥' : '🟨';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      default:
        return '⏰';
    }
  };

  const renderEvent = (event: any, index: number) => {
    const teamColor = event.isHome ? homeTeamColor : awayTeamColor;
    
    if (event.type === 'goal') {
      const playerName = event.source === 'timeline' ? event.data.playerName : getGoalPlayerName(event.data);
      const assistName = event.source === 'timeline' ? event.data.assistPlayerName : getGoalAssistPlayerName(event.data);
      
      return (
        <div 
          key={`event-goal-${event.data.id || index}`} 
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border-l-4 border-l-green-200"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {getEventIcon('goal')}
            </div>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: teamColor }}
            />
            <div className="flex-1">
              <div className="font-medium text-sm flex items-center gap-2">
                <span>⚽</span>
                <span>{playerName}</span>
              </div>
              {assistName && (
                <div className="text-xs text-muted-foreground">
                  Assist: {assistName}
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {timeFormatter(event.time)}
          </Badge>
        </div>
      );
    } else if (event.type === 'card' || event.type === 'yellow_card' || event.type === 'red_card') {
      const playerName = event.source === 'timeline' ? event.data.playerName : getCardPlayerName(event.data);
      const cardType = event.source === 'timeline' ? event.type : getCardType(event.data);
      const isRedCard = event.source === 'timeline' ? event.type === 'red_card' : isCardRed(event.data);
      
      return (
        <div 
          key={`event-card-${event.data.id || index}`} 
          className={`flex items-center justify-between p-3 bg-muted/50 rounded-lg border-l-4 ${
            isRedCard ? 'border-l-red-200' : 'border-l-yellow-200'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {getEventIcon(event.type)}
            </div>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: teamColor }}
            />
            <div className="flex-1">
              <div className="font-medium text-sm flex items-center gap-2">
                <span>{getEventEmoji(event.type, isRedCard)}</span>
                <span>{playerName}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {cardType?.toUpperCase()} Card
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {timeFormatter(event.time)}
          </Badge>
        </div>
      );
    } else {
      // Handle other timeline events
      return (
        <div 
          key={`event-other-${event.data.id || index}`} 
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border-l-4 border-l-blue-200"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {getEventIcon(event.type)}
            </div>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: teamColor }}
            />
            <div className="flex-1">
              <div className="font-medium text-sm">
                {event.data.description || `${event.data.playerName} - ${event.type}`}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {timeFormatter(event.time)}
          </Badge>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4" />
          Match Events ({uniqueEvents.length})
        </h4>
        
        {uniqueEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No events recorded</p>
        ) : (
          <div className="space-y-3">
            {uniqueEvents.map((event, index) => renderEvent(event, index))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchEventsSection;
