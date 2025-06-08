
import AnimatedRankIndicator from "./AnimatedRankIndicator";

interface RankChangeIndicatorProps {
  currentPosition: number;
  previousPosition?: number | null;
}

const RankChangeIndicator = ({ currentPosition, previousPosition }: RankChangeIndicatorProps) => {
  return (
    <AnimatedRankIndicator 
      currentPosition={currentPosition} 
      previousPosition={previousPosition} 
    />
  );
};

export default RankChangeIndicator;
