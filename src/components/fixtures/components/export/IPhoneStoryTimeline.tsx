
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IPhoneStoryTimelineProps {
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
}

const IPhoneStoryTimeline = ({ timelineEvents, formatTime }: IPhoneStoryTimelineProps) => {
  if (timelineEvents.length === 0) return null;

  return (
    <div className="px-4 py-4 bg-slate-25 border-b border-slate-100">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center">
          <Clock className="h-3 w-3 text-white" />
        </div>
        <h3 className="font-semibold text-sm text-slate-800 text-center">
          Timeline ({timelineEvents.length})
        </h3>
      </div>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {timelineEvents.slice(0, 6).map((event, index) => (
          <div 
            key={`timeline-${event.id}-${index}`}
            className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-slate-700 truncate">
                {event.event_type?.replace('_', ' ').toUpperCase() || 'EVENT'}
              </span>
              {event.player_name && (
                <span className="text-xs text-slate-500 truncate">
                  • {event.player_name}
                </span>
              )}
            </div>
            
            <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 border-slate-300 flex-shrink-0">
              {formatTime(event.time_seconds || 0)}
            </Badge>
          </div>
        ))}
        
        {timelineEvents.length > 6 && (
          <div className="text-center text-xs text-slate-500 pt-2">
            +{timelineEvents.length - 6} more events
          </div>
        )}
      </div>
    </div>
  );
};

export default IPhoneStoryTimeline;
