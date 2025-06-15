import { Badge } from "@/components/ui/badge";

interface MatchEventsTimelineProps {
  events: any[];
  formatTime: (seconds: number) => string;
}

const MatchEventsTimeline = ({
  events,
  formatTime
}: MatchEventsTimelineProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Match Events Timeline ({events.length})</h4>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No events recorded</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {events.slice(-8).reverse().map((event) => (
            <div key={event.id} className="text-sm p-3 bg-muted/10 rounded border-l-4 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-medium">{event.description}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {
                      // Use new time rounding formatter here
                      (() => {
                        const { roundSecondsUpToMinute } = require("@/utils/timeUtils");
                        return `${roundSecondsUpToMinute(event.time)}'`;
                      })()
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
          {events.length > 8 && (
            <p className="text-xs text-muted-foreground text-center">
              Showing last 8 events of {events.length} total
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchEventsTimeline;
