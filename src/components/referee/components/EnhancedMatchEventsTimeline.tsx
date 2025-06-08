
import { Clock, Goal, UserX, Trophy } from "lucide-react";
import EnhancedTimeBadge from "../../fixtures/components/EnhancedTimeBadge";

interface TimelineEvent {
  id: number;
  type: string;
  time: number;
  playerName: string;
  teamId: string;
  teamName: string;
  cardType?: string;
  assistPlayerName?: string;
  assistTeamId?: string;
  description: string;
  timestamp: string;
}

interface EnhancedMatchEventsTimelineProps {
  timelineEvents: TimelineEvent[];
  formatTime: (seconds: number) => string;
}

const EnhancedMatchEventsTimeline = ({
  timelineEvents,
  formatTime
}: EnhancedMatchEventsTimelineProps) => {
  
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Goal className="h-4 w-4 text-green-600" />;
      case 'yellow_card':
        return <UserX className="h-4 w-4 text-yellow-600" />;
      case 'red_card':
        return <UserX className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventEmoji = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return '⚽';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      default:
        return '⏰';
    }
  };

  const formatEventDescription = (event: TimelineEvent) => {
    const emoji = getEventEmoji(event.type);
    const time = formatTime(event.time);
    
    const displayTeamName = event.teamName && event.teamName !== event.teamId 
      ? event.teamName 
      : event.teamId;
    
    switch (event.type) {
      case 'goal':
        if (event.assistPlayerName) {
          return `${emoji} ${time} - ${event.playerName} scores for ${displayTeamName}! Assist by ${event.assistPlayerName}.`;
        }
        return `${emoji} ${time} - ${event.playerName} scores for ${displayTeamName}!`;
      
      case 'yellow_card':
        return `${emoji} ${time} - Yellow for ${event.playerName} (${displayTeamName})`;
      
      case 'red_card':
        return `${emoji} ${time} - Red for ${event.playerName} (${displayTeamName})`;
      
      default:
        return `${emoji} ${time} - ${event.description}`;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return 'Goal';
      case 'yellow_card':
        return 'Yellow';
      case 'red_card':
        return 'Red';
      default:
        return eventType;
    }
  };

  const getTimeBadgeVariant = (eventType: string): 'goal' | 'yellow' | 'red' | 'default' => {
    switch (eventType) {
      case 'goal':
        return 'goal';
      case 'yellow_card':
        return 'yellow';
      case 'red_card':
        return 'red';
      default:
        return 'default';
    }
  };

  // Filter out standalone assist events and sort by time (chronological order)
  const filteredAndSortedEvents = timelineEvents
    .filter(event => event.type !== 'assist')
    .sort((a, b) => a.time - b.time);

  return (
    <>
      {filteredAndSortedEvents.length === 0 ? (
        <div className="text-center py-8 timeline-gradient rounded-lg border border-muted/20 premier-card-shadow">
          <p className="text-sm text-muted-foreground">
            No timeline events recorded for this match
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedEvents.map((event, index) => (
            <div 
              key={`${event.id}-${index}`}
              className="relative flex items-start gap-3 p-3 event-item-gradient rounded-lg border-l-4 border-l-primary/30 hover:bg-muted/20 transition-colors premier-card-shadow"
            >
              <div className="flex-shrink-0 mt-0.5 p-1 rounded-full bg-background shadow-sm">
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {formatEventDescription(event)}
                  </p>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <EnhancedTimeBadge 
                      time={`${formatTime(event.time)}'`}
                      variant={getTimeBadgeVariant(event.type)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAndSortedEvents.length > 10 && (
            <div className="text-xs text-muted-foreground text-center pt-2 match-gradient-primary rounded p-2 border border-muted/20">
              Showing all {filteredAndSortedEvents.length} timeline events
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EnhancedMatchEventsTimeline;
