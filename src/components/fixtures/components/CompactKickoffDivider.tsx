
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import { cn } from "@/lib/utils";

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
    <div className={cn("flex items-center justify-center py-3 px-2", className)}>
      {/* Decorative line on left */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border/40"></div>
      
      {/* Center content with enhanced mobile layout */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 px-4 sm:px-6 text-center min-w-0">
        {/* Status badge */}
        <Badge 
          variant="outline" 
          className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 font-medium border-border/50 bg-background/80 backdrop-blur-sm whitespace-nowrap"
        >
          {getStatusText(fixture.status)}
        </Badge>
        
        {/* Score or VS */}
        <span className="text-lg sm:text-xl font-bold text-foreground whitespace-nowrap">
          {getCenterContent()}
        </span>
        
        {/* Date and time with improved mobile layout */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">
              {formatDateDisplay(fixture.match_date)}
            </span>
          </span>
          <span className="hidden sm:inline text-border/60">•</span>
          <span className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{formatTimeDisplay(fixture.match_time)}</span>
          </span>
        </div>
      </div>
      
      {/* Decorative line on right */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border/40"></div>
    </div>
  );
};

export default CompactKickoffDivider;
