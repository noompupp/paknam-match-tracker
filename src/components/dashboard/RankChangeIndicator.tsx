
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center text-muted-foreground">
              <Minus className="h-3 w-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>No change in position</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Position improved (moved up)
  if (positionChange > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center text-green-600">
              <ArrowUp className="h-3 w-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Up {positionChange} position{positionChange > 1 ? 's' : ''}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Position declined (moved down)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center text-red-600">
            <ArrowDown className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Down {Math.abs(positionChange)} position{Math.abs(positionChange) > 1 ? 's' : ''}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RankChangeIndicator;
