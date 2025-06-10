
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
      return `${fixture.home_score || 0} - ${fixture.away_score || 0}`;
    } else if (fixture.status === 'live') {
      return `${fixture.home_score || 0} - ${fixture.away_score || 0}`;
    } else {
      return 'VS';
    }
  };

  return (
    <div className={`flex items-center justify-center py-2 ${className}`}>
      {/* Subtle decorative line on left */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border/40"></div>
      
      {/* More compact center content */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 text-center">
        {/* Status badge - more compact */}
        <Badge 
          variant="outline" 
          className="text-xs px-2 py-1 font-medium border-border/50 bg-background/50"
        >
          {getStatusText(fixture.status)}
        </Badge>
        
        {/* Score or VS - reduced size */}
        <span className="text-base sm:text-lg font-semibold text-muted-foreground">
          {getCenterContent()}
        </span>
        
        {/* Date and time - more compact layout */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">{formatDateDisplay(fixture.match_date)}</span>
            <span className="sm:hidden">{formatDateDisplay(fixture.match_date).slice(0, 5)}</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimeDisplay(fixture.match_time)}
          </span>
        </div>
      </div>
      
      {/* Subtle decorative line on right */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border/40"></div>
    </div>
  );
};

export default CompactKickoffDivider;
