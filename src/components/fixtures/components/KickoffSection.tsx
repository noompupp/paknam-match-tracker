
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";

interface KickoffSectionProps {
  fixture: Fixture;
  className?: string;
}

const KickoffSection = ({ fixture, className = "" }: KickoffSectionProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 hover:bg-green-700';
      case 'live':
        return 'bg-red-600 hover:bg-red-700 animate-pulse';
      case 'scheduled':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-muted hover:bg-muted/80';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Full Time';
      case 'live':
        return 'Live';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className={`text-center py-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border ${className}`}>
      {/* Match Status */}
      <div className="mb-4">
        <Badge className={`${getStatusColor(fixture.status)} text-white font-medium px-4 py-2`}>
          {getStatusText(fixture.status)}
        </Badge>
      </div>

      {/* Score or VS */}
      <div className="mb-4">
        {fixture.status === 'completed' ? (
          <div className="space-y-2">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight">
              {fixture.home_score || 0} - {fixture.away_score || 0}
            </div>
            <p className="text-sm text-muted-foreground">Final Score</p>
          </div>
        ) : fixture.status === 'live' ? (
          <div className="space-y-2">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-red-600">
              {fixture.home_score || 0} - {fixture.away_score || 0}
            </div>
            <p className="text-sm text-red-600 font-medium animate-pulse">LIVE</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl font-bold text-muted-foreground">VS</div>
            <p className="text-sm text-muted-foreground">Kick Off</p>
          </div>
        )}
      </div>

      {/* Match Date and Time */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{formatDateDisplay(fixture.match_date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{formatTimeDisplay(fixture.match_time)}</span>
        </div>
      </div>
    </div>
  );
};

export default KickoffSection;
