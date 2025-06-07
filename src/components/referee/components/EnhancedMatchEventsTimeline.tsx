
import { Badge } from "@/components/ui/badge";
import { Clock, Goal, UserX, Trophy, Calendar } from "lucide-react";

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
        return <Goal className="h-5 w-5 text-green-600" />;
      case 'assist':
        return <Trophy className="h-5 w-5 text-blue-600" />;
      case 'yellow_card':
        return <UserX className="h-5 w-5 text-yellow-600" />;
      case 'red_card':
        return <UserX className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
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

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return 'border-l-green-400 bg-green-50/50';
      case 'assist':
        return 'border-l-blue-400 bg-blue-50/50';
      case 'yellow_card':
        return 'border-l-yellow-400 bg-yellow-50/50';
      case 'red_card':
        return 'border-l-red-400 bg-red-50/50';
      default:
        return 'border-l-gray-400 bg-gray-50/50';
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
    <div className="animate-fade-in">
      {sortedEvents.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="animate-bounce mb-4">
            <Clock className="h-12 w-12 text-slate-300 mx-auto" />
          </div>
          <p className="text-lg font-medium text-slate-500 mb-2">No timeline events recorded</p>
          <p className="text-sm text-slate-400">Match events will appear here as they happen</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Timeline header with enhanced visual indicators */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="p-2 bg-blue-500 rounded-full">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-lg">Match Timeline</h4>
              <p className="text-sm text-blue-700">Chronological order of events ({sortedEvents.length} total)</p>
            </div>
          </div>

          {sortedEvents.map((event, index) => (
            <div 
              key={`${event.id}-${index}`}
              className={`relative flex items-start gap-4 p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fade-in ${getEventColor(event.type)}`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Enhanced event icon with pulsing animation */}
              <div className="flex-shrink-0 mt-1 p-2 bg-white rounded-full shadow-sm animate-pulse">
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    {formatEventDescription(event)}
                  </p>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge 
                      variant={getEventVariant(event.type)} 
                      className="text-xs font-medium px-3 py-1 transition-all duration-300 hover:scale-105"
                    >
                      {getEventTypeLabel(event.type)}
                    </Badge>
                    <div className="text-xs text-muted-foreground font-mono bg-slate-100 px-2 py-1 rounded tabular-nums">
                      {formatTime(event.time)}'
                    </div>
                  </div>
                </div>
                
                {event.assistPlayerName && event.type === 'goal' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 px-3 py-1 rounded-full w-fit">
                    <Trophy className="h-3 w-3" />
                    <span>Assisted by {event.assistPlayerName}</span>
                  </div>
                )}
              </div>

              {/* Timeline connector */}
              {index < sortedEvents.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent"></div>
              )}
            </div>
          ))}
          
          {sortedEvents.length > 10 && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground bg-slate-100 px-4 py-2 rounded-full inline-block">
                Timeline complete • {sortedEvents.length} events recorded
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMatchEventsTimeline;
