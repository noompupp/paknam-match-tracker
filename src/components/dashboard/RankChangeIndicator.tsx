
interface RankChangeIndicatorProps {
  currentPosition: number;
  previousPosition: number | null;
}

const RankChangeIndicator = ({ currentPosition, previousPosition }: RankChangeIndicatorProps) => {
  // If no previous position data, show neutral indicator
  if (previousPosition === null || previousPosition === undefined) {
    return (
      <span className="text-muted-foreground text-sm font-bold w-3 inline-block text-center">–</span>
    );
  }

  const positionChange = previousPosition - currentPosition;
  
  // No change - show neutral indicator
  if (positionChange === 0) {
    return (
      <span className="text-muted-foreground text-sm font-bold w-3 inline-block text-center">–</span>
    );
  }
  
  // Position improved (moved up) - show green up triangle
  if (positionChange > 0) {
    return (
      <span className="text-green-600 text-sm font-bold w-3 inline-block text-center">▲</span>
    );
  }
  
  // Position declined (moved down) - show red down triangle
  return (
    <span className="text-red-600 text-sm font-bold w-3 inline-block text-center">▼</span>
  );
};

export default RankChangeIndicator;
