import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, User } from "lucide-react";
import { useDeleteMatchEvent } from "@/hooks/useMatchEvents";
import { useToast } from "@/hooks/use-toast";

interface EventManagementListProps {
  events: any[];
  formatTime: (seconds: number) => string;
  onEditEvent: (event: any) => void;
}

const EventManagementList = ({ events, formatTime, onEditEvent }: EventManagementListProps) => {
  const deleteEvent = useDeleteMatchEvent();
  const { toast } = useToast();

  const handleDelete = async (eventId: number, fixtureId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent.mutateAsync({ eventId, fixtureId });
      toast({
        title: "Event Deleted",
        description: "Event removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'goal': return 'bg-green-100 text-green-800';
      case 'assist': return 'bg-blue-100 text-blue-800';
      case 'yellow_card': return 'bg-yellow-100 text-yellow-800';
      case 'red_card': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No events recorded yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Events ({events.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className={getEventBadgeColor(event.event_type)}>
                {event.event_type.replace('_', ' ')}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(event.event_time)}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="font-medium">{event.player_name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEditEvent(event)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(event.id, event.fixture_id)}
                disabled={deleteEvent.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EventManagementList;