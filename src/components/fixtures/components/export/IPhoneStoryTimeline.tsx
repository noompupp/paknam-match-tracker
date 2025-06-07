
import { Badge } from "@/components/ui/badge";
import { Clock, Goal, UserX } from "lucide-react";

interface IPhoneStoryTimelineProps {
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
}

const IPhoneStoryTimeline = ({ timelineEvents, formatTime }: IPhoneStoryTimelineProps) => {
  if (timelineEvents.length === 0) return null;

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Goal className="h-3 w-3 text-green-600" />;
      case 'yellow_card':
        return <UserX className="h-3 w-3 text-yellow-600" />;
      case 'red_card':
        return <UserX className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
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

  const getEventVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (eventType) {
      case 'goal':
        return 'default';
      case 'yellow_card':
        return 'outline';
      case 'red_card':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Sort events by time and limit to first 6 for mobile layout
  const sortedEvents = [...timelineEvents]
    .sort((a, b) => a.time - b.time)
    .slice(0, 6);

  return (
    <div className="px-4 py-4 bg-slate-25 border-t border-slate-100">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <Clock className="h-3 w-3 text-white" />
        </div>
        <h3 className="font-semibold text-sm text-slate-800 text-center">
          Match Timeline ({timelineEvents.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {sortedEvents.map((event, index) => (
          <div 
            key={`timeline-${event.id}-${index}`}
            className="flex items-center justify-between p-2 bg-white rounded border"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {getEventIcon(event.type)}
              </div>
              <Badge 
                variant={getEventVariant(event.type)}
                className="text-xs px-1.5 py-0.5 font-medium flex-shrink-0"
              >
                {event.type === 'goal' ? 'GOAL' : 
                 event.type === 'yellow_card' ? 'YC' : 
                 event.type === 'red_card' ? 'RC' : 
                 event.type.toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-700 truncate flex-1 text-center font-medium">
                {event.playerName}
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-mono ml-2 flex-shrink-0">
              {formatTime(event.time)}'
            </div>
          </div>
        ))}
      </div>
      
      {timelineEvents.length > 6 && (
        <div className="text-center mt-2 p-1.5 bg-white rounded border">
          <span className="text-xs text-slate-500 font-medium">
            +{timelineEvents.length - 6} more events
          </span>
        </div>
      )}
    </div>
  );
};

export default IPhoneStoryTimeline;
