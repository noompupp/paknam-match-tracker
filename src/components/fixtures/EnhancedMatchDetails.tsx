
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

interface EnhancedMatchDetailsProps {
  fixture: any;
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
}

const EnhancedMatchDetails = ({ fixture, timelineEvents, formatTime }: EnhancedMatchDetailsProps) => {
  // Calculate match statistics from timeline
  const totalGoals = timelineEvents.filter(event => event.type === 'goal').length;
  const totalCards = timelineEvents.filter(event => 
    event.type === 'yellow_card' || event.type === 'red_card'
  ).length;
  
  // Get the latest event time for match duration estimate
  const lastEventTime = timelineEvents.length > 0 
    ? Math.max(...timelineEvents.map(event => event.time))
    : 0;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Match Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Match Date</div>
              <div className="text-muted-foreground">{fixture.match_date || 'TBD'}</div>
            </div>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Venue</div>
              <div className="text-muted-foreground">{fixture.venue || 'TBD'}</div>
            </div>
          </div>

          {/* Match Duration */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Duration</div>
              <div className="text-muted-foreground">
                {lastEventTime > 0 ? `${Math.floor(lastEventTime / 60)}'` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Match Stats */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Events</div>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {totalGoals} Goals
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {totalCards} Cards
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex justify-center">
          <Badge 
            variant={fixture.status === 'completed' ? 'default' : 'secondary'}
            className="px-4 py-1"
          >
            {fixture.status?.toUpperCase() || 'SCHEDULED'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMatchDetails;
