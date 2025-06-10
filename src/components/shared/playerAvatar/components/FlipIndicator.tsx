
import { TeamColors } from "../types";
import { getFlipIndicatorStyle } from "../utils/styleUtils";

interface FlipIndicatorProps {
  isFlipped: boolean;
  teamColors: TeamColors;
}

const FlipIndicator = ({ isFlipped, teamColors }: FlipIndicatorProps) => {
  return (
    <div 
      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-background/50 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      style={getFlipIndicatorStyle(teamColors)}
    >
      <span className="text-[8px] font-bold">
        {isFlipped ? '🔄' : '↻'}
      </span>
    </div>
  );
};

export default FlipIndicator;
