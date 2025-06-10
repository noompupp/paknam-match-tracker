
import { Calendar } from "lucide-react";
import { getFriendlyDateLabel } from "@/utils/dateGroupingUtils";

interface DateGroupHeaderProps {
  date: string;
  displayDate: string;
  fixtureCount: number;
  gameweek?: number;
}

const DateGroupHeader = ({ date, displayDate, fixtureCount, gameweek }: DateGroupHeaderProps) => {
  const friendlyLabel = getFriendlyDateLabel(date, displayDate);
  
  return (
    <div className="flex items-center gap-3 py-3 px-1">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{friendlyLabel}</h3>
      </div>
      <div className="flex-1 h-px bg-border" />
      <span className="text-sm text-muted-foreground font-medium">
        {gameweek ? `GW${gameweek}` : `${fixtureCount} ${fixtureCount === 1 ? 'match' : 'matches'}`}
      </span>
    </div>
  );
};

export default DateGroupHeader;
