
import { Badge } from "@/components/ui/badge";
import { Clock, Goal, UserX, Trophy } from "lucide-react";

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
      case 'assist':
        return <Trophy className="h-4 w-4 text-blue-600" />;
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
      case 'assist':
        return '🅰️';
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
      
      case 'assist':
        return `${emoji} ${time} - ${event.playerName} (${displayTeamName}) with the assist!`;
      
      case 'yellow_card':
        return `${emoji} ${time} - Yellow card for ${event.playerName} (${displayTeamName})`;
      
      case 'red_card':
        return `${emoji} ${time} - Red card for ${event.playerName} (${displayTeamName})`;
      
      default:
        return `${emoji} ${time} - ${event.description}`;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return 'Goal';
      case 'assist':
        return 'Assist';
      case 'yellow_card':
        return 'Yellow Card';
      case 'red_card':
        return 'Red Card';
      default:
        return eventType;
    }
  };

  const getEventVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (eventType) {
      case 'goal':
        return 'default';
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

  // Sort events by time (chronological order)
  const sortedEvents = [...timelineEvents].sort((a, b) => a.time - b.time);

  return (
    <>
      {sortedEvents.length === 0 ? (
        <div className="text-center py-8 timeline-gradient rounded-lg border border-muted/20 premier-card-shadow">
          <p className="text-sm text-muted-foreground">
            No timeline events recorded for this match
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((event, index) => (
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
                    <Badge 
                      variant={getEventVariant(event.type)} 
                      className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10"
                    >
                      {getEventTypeLabel(event.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono bg-muted/20 px-2 py-1 rounded">
                      {formatTime(event.time)}'
                    </span>
                  </div>
                </div>
                
                {event.assistPlayerName && event.type === 'goal' && (
                  <p className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded border border-blue-200">
                    🅰️ Assisted by {event.assistPlayerName}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {sortedEvents.length > 10 && (
            <p className="text-xs text-muted-foreground text-center pt-2 bg-muted/10 rounded p-2">
              Showing all {sortedEvents.length} timeline events
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default EnhancedMatchEventsTimeline;
