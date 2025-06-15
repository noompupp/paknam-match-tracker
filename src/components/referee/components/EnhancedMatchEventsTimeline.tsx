
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, Users } from "lucide-react";
import { roundSecondsUpToMinute } from "@/utils/timeUtils";

interface LocalTimelineEvent {
  id: string | number;
  type: string;
  time: number;
  playerName: string;
  teamId: string;
  teamName: string;
  cardType?: string;
  assistPlayerName?: string | null;
  assistTeamId?: string | null;
  description: string;
  timestamp: number;
  isOwnGoal?: boolean;
}

interface EnhancedMatchEventsTimelineProps {
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
}

const EnhancedMatchEventsTimeline = ({
  timelineEvents,
  formatTime
}: EnhancedMatchEventsTimelineProps) => {
  // Convert timeline events to local type to handle type conflicts
  const localEvents: LocalTimelineEvent[] = timelineEvents.map(event => ({
    id: String(event.id), // Convert to string to handle both string and number ids
    type: event.type,
    time: event.time,
    playerName: event.playerName,
    teamId: event.teamId,
    teamName: event.teamName,
    cardType: event.cardType,
    assistPlayerName: event.assistPlayerName,
    assistTeamId: event.assistTeamId,
    description: event.description,
    timestamp: event.timestamp,
    isOwnGoal: event.isOwnGoal
  }));

  const getEventIcon = (event: LocalTimelineEvent) => {
    if (event.type === 'goal') {
      return event.isOwnGoal ? 
        <Target className="h-4 w-4 text-red-500" /> : 
        <Target className="h-4 w-4 text-green-500" />;
    }
    if (event.type === 'assist') {
      return <Users className="h-4 w-4 text-blue-500" />;
    }
    if (event.type === 'yellow_card' || event.type === 'red_card') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  const getEventBadgeVariant = (event: LocalTimelineEvent) => {
    if (event.type === 'goal') {
      return event.isOwnGoal ? 'destructive' : 'default';
    }
    if (event.type === 'assist') return 'secondary';
    if (event.type === 'yellow_card') return 'outline';
    if (event.type === 'red_card') return 'destructive';
    return 'outline';
  };

  const getEventLabel = (event: LocalTimelineEvent) => {
    if (event.type === 'goal') {
      return event.isOwnGoal ? 'Own Goal' : 'Goal';
    }
    if (event.type === 'assist') return 'Assist';
    if (event.type === 'yellow_card') return 'Yellow Card';
    if (event.type === 'red_card') return 'Red Card';
    return event.type;
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Enhanced Match Timeline ({localEvents.length} events)</h4>
      {localEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No timeline events recorded</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {localEvents
            .sort((a, b) => b.time - a.time) // Most recent first
            .map((event) => (
              <div key={event.id} className="text-sm p-3 bg-muted/10 rounded border-l-4 border-primary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.playerName}</span>
                        <Badge variant={getEventBadgeVariant(event)} className="text-xs">
                          {getEventLabel(event)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {event.teamName}
                        {event.isOwnGoal && (
                          <span className="ml-2 text-red-600 font-medium">(Own Goal)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {roundSecondsUpToMinute(event.time)}'
                  </span>
                </div>
              </div>
            ))}
          {localEvents.length > 10 && (
            <p className="text-xs text-muted-foreground text-center">
              Showing all {localEvents.length} timeline events
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMatchEventsTimeline;
