
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface MatchEvent {
  id: number;
  type: string;
  description: string;
  time: number;
}

interface MatchEventsProps {
  events: MatchEvent[];
  formatTime: (seconds: number) => string;
}

const MatchEvents = ({ events, formatTime }: MatchEventsProps) => {
  const formatEventType = (type: string) => {
    // Clean up event type display
    return type.replace(/_/g, ' ').replace(/\s+card$/i, '').toUpperCase();
  };

  const getEventBadgeVariant = (type: string) => {
    if (type === 'goal') return 'default';
    if (type === 'card' || type.includes('card')) return 'destructive';
    if (type.includes('player')) return 'secondary';
    return 'outline';
  };

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="text-contrast">Match Events</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-contrast-muted text-center py-4">No events recorded yet</p>
        ) : (
          <div className="space-y-3">
            {events.slice().reverse().map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-subtle rounded-lg border border-subtle">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm font-mono time-display">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(event.time)}
                  </Badge>
                  <span className="font-medium text-contrast">{event.description}</span>
                </div>
                <Badge variant={getEventBadgeVariant(event.type)}>
                  {formatEventType(event.type)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchEvents;
