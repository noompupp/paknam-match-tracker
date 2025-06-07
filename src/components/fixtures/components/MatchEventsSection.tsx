
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

  console.log('📊 MatchEventsSection - Input Data Analysis:', {
    goalsInput: goals.length,
    cardsInput: cards.length,
    timelineEventsInput: timelineEvents.length,
    processedHomeGoals: processedEvents.homeGoals.length,
    processedAwayGoals: processedEvents.awayGoals.length,
    fixtureHomeTeamId: fixture?.home_team_id,
    fixtureAwayTeamId: fixture?.away_team_id
  });

  // Create a more reliable way to determine team membership
  const isHomeTeamEvent = (event: any, eventType: string) => {
    if (eventType === 'goal') {
      // Check if this goal is in the processedEvents.homeGoals array
      const isInHomeGoals = processedEvents.homeGoals.some(homeGoal => 
        homeGoal.id === event.id || 
        (homeGoal.playerName === getGoalPlayerName(event) && homeGoal.time === getGoalTime(event))
      );
      return isInHomeGoals;
    } else if (eventType === 'card') {
      const cardTeamId = getCardTeamId(event);
      return String(cardTeamId) === String(fixture?.home_team_id);
    } else if (event.teamId) {
      return String(event.teamId) === String(fixture?.home_team_id);
    }
    return false;
  };

  // Combine all events with improved logic
  const allEvents = [];

  // Add goals from props
  goals.forEach(goal => {
    const isHome = isHomeTeamEvent(goal, 'goal');
    allEvents.push({
      type: 'goal',
      time: getGoalTime(goal),
      data: goal,
      isHome,
      source: 'props',
      id: `goal-${goal.id || goal.playerName}-${getGoalTime(goal)}`
    });
  });

  // Add cards from props
  cards.forEach(card => {
    const isHome = isHomeTeamEvent(card, 'card');
    allEvents.push({
      type: 'card',
      time: getCardTime(card),
      data: card,
      isHome,
      source: 'props',
      id: `card-${card.id || card.playerName}-${getCardTime(card)}`
    });
  });

  // Add timeline events (if they don't duplicate props events)
  timelineEvents.forEach(event => {
    const eventId = `${event.type}-${event.playerName}-${event.time}`;
    
    // Check if this timeline event duplicates a props event
    const isDuplicate = allEvents.some(existing => {
      if (existing.type !== event.type) return false;
      
      const timeDiff = Math.abs(existing.time - event.time);
      const playerMatches = existing.type === 'goal' 
        ? getGoalPlayerName(existing.data) === event.playerName
        : getCardPlayerName(existing.data) === event.playerName;
      
      return timeDiff <= 30 && playerMatches; // Allow 30 second tolerance
    });

    if (!isDuplicate) {
      const isHome = isHomeTeamEvent(event, event.type);
      allEvents.push({
        type: event.type,
        time: event.time,
        data: event,
        isHome,
        source: 'timeline',
        id: eventId
      });
    }
  });

  // Sort by time
  const sortedEvents = allEvents.sort((a, b) => a.time - b.time);

  console.log('📊 MatchEventsSection - Final Events Analysis:', {
    totalEvents: sortedEvents.length,
    goalEvents: sortedEvents.filter(e => e.type === 'goal').length,
    cardEvents: sortedEvents.filter(e => e.type === 'card' || e.type === 'yellow_card' || e.type === 'red_card').length,
    homeEvents: sortedEvents.filter(e => e.isHome).length,
    awayEvents: sortedEvents.filter(e => !e.isHome).length,
    eventBreakdown: sortedEvents.map(e => ({
      type: e.type,
      time: e.time,
      isHome: e.isHome,
      source: e.source,
      player: e.type === 'goal' ? getGoalPlayerName(e.data) : getCardPlayerName(e.data)
    }))
  });

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
          key={event.id} 
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
          key={event.id} 
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
          key={event.id} 
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
          Match Events ({sortedEvents.length})
        </h4>
        
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">No events recorded</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Goals from props: {goals.length}</div>
              <div>Cards from props: {cards.length}</div>
              <div>Timeline events: {timelineEvents.length}</div>
              <div>Processed home goals: {processedEvents.homeGoals.length}</div>
              <div>Processed away goals: {processedEvents.awayGoals.length}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event, index) => renderEvent(event, index))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchEventsSection;
