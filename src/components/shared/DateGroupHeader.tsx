
import { Calendar } from "lucide-react";
import { getFriendlyDateLabel } from "@/utils/dateGroupingUtils";

interface DateGroupHeaderProps {
  date: string;
  displayDate: string;
  fixtureCount: number;
  gameweek?: number;
  gameweekLabel?: string;
  isFinalGameweek?: boolean;
}

const DateGroupHeader = ({ 
  date, 
  displayDate, 
  fixtureCount, 
  gameweek,
  gameweekLabel,
  isFinalGameweek = false
}: DateGroupHeaderProps) => {
  const friendlyLabel = getFriendlyDateLabel(date, displayDate);
  
  // Determine what to show on the right side
  const getRightSideContent = () => {
    if (gameweekLabel) {
      return (
        <div className={`
          px-3 py-1.5 rounded-lg font-bold text-sm
          ${isFinalGameweek 
            ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 border border-amber-300/30' 
            : 'bg-primary/10 text-primary border border-primary/20'
          }
          shadow-sm
        `}>
          {gameweekLabel}
        </div>
      );
    }
    
    return (
      <span className="text-sm text-muted-foreground font-medium px-2 py-1 bg-muted/50 rounded">
        {fixtureCount} {fixtureCount === 1 ? 'match' : 'matches'}
      </span>
    );
  };
  
  return (
    <div className="flex items-center gap-3 py-3 px-1">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{friendlyLabel}</h3>
      </div>
      <div className="flex-1 h-px bg-border" />
      {getRightSideContent()}
    </div>
  );
};

export default DateGroupHeader;
