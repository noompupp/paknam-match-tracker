
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RankChangeIndicatorProps {
  currentPosition: number;
  previousPosition: number | null;
}

const RankChangeIndicator = ({ currentPosition, previousPosition }: RankChangeIndicatorProps) => {
  // If no previous position data, don't show indicator
  if (previousPosition === null || previousPosition === undefined) {
    return null;
  }

  const positionChange = previousPosition - currentPosition;
  
  // No change
  if (positionChange === 0) {
    return (
      <div className="flex items-center text-muted-foreground" title="No change">
        <Minus className="h-3 w-3" />
      </div>
    );
  }
  
  // Position improved (moved up)
  if (positionChange > 0) {
    return (
      <div className="flex items-center text-green-600" title={`Up ${positionChange} position${positionChange > 1 ? 's' : ''}`}>
        <TrendingUp className="h-3 w-3" />
        <span className="text-xs ml-0.5">+{positionChange}</span>
      </div>
    );
  }
  
  // Position declined (moved down)
  return (
    <div className="flex items-center text-red-600" title={`Down ${Math.abs(positionChange)} position${Math.abs(positionChange) > 1 ? 's' : ''}`}>
      <TrendingDown className="h-3 w-3" />
      <span className="text-xs ml-0.5">{positionChange}</span>
    </div>
  );
};

export default RankChangeIndicator;
