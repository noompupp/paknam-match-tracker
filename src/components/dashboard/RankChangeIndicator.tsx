
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
    return null;
  }
  
  // Position improved (moved up)
  if (positionChange > 0) {
    return (
      <span className="text-green-600 text-sm font-bold">▲</span>
    );
  }
  
  // Position declined (moved down)
  return (
    <span className="text-red-600 text-sm font-bold">▼</span>
  );
};

export default RankChangeIndicator;
