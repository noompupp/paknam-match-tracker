
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";

interface CompactKickoffDividerProps {
  fixture: Fixture;
  className?: string;
}

const CompactKickoffDivider = ({ fixture, className = "" }: CompactKickoffDividerProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 hover:bg-green-700 border-green-500';
      case 'live':
        return 'bg-red-600 hover:bg-red-700 border-red-500 animate-pulse';
      case 'scheduled':
        return 'bg-blue-600 hover:bg-blue-700 border-blue-500';
      default:
        return 'bg-muted hover:bg-muted/80 border-border';
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

  const getCenterContent = () => {
    if (fixture.status === 'completed') {
      return (
        <div className="text-2xl font-bold text-green-600">
          {fixture.home_score || 0} - {fixture.away_score || 0}
        </div>
      );
    } else if (fixture.status === 'live') {
      return (
        <div className="text-2xl font-bold text-red-600 animate-pulse">
          {fixture.home_score || 0} - {fixture.away_score || 0}
        </div>
      );
    } else {
      return (
        <div className="text-xl font-bold text-muted-foreground">
          VS
        </div>
      );
    }
  };

  return (
    <div className={`relative flex items-center justify-between py-4 px-6 bg-gradient-to-r from-muted/30 via-background/60 to-muted/30 rounded-lg border backdrop-blur-sm ${className}`}>
      {/* Decorative line on left */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border"></div>
      
      {/* Center content */}
      <div className="flex items-center gap-4 px-6">
        {/* Status badge */}
        <Badge className={`${getStatusColor(fixture.status)} text-white font-medium px-3 py-1 text-xs border shadow-sm`}>
          {getStatusText(fixture.status)}
        </Badge>
        
        {/* Score or VS */}
        {getCenterContent()}
        
        {/* Date and time */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDateDisplay(fixture.match_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeDisplay(fixture.match_time)}</span>
          </div>
        </div>
      </div>
      
      {/* Decorative line on right */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border"></div>
    </div>
  );
};

export default CompactKickoffDivider;
