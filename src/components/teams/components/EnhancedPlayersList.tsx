
import EnhancedPlayerCard from "./EnhancedPlayerCard";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

// Accepts 'players', 'isLoading', etc. as props
const EnhancedPlayersList = ({
  players,
  isLoading,
  showDetailedStats = false,
  variant, // passing down from parent if needed but we control computedVariant below
}) => {
  const { isMobile, isPortrait } = useDeviceOrientation();

  // Compute layout mode for each device/orientation
  const isMobilePortrait = isMobile && isPortrait;
  const computedVariant = isMobilePortrait ? "compact" : "default";
  const computedDetailedStats = !isMobilePortrait;

  if (isLoading) {
    // Show skeletons (not modified here)
    return (
      <div className="space-y-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        isMobilePortrait
          ? "space-y-3"
          : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      }
    >
      {players?.map((player, idx) => (
        <EnhancedPlayerCard
          key={player.id}
          player={player}
          // Force default variant and full stats for non-mobile-portrait layouts
          showDetailedStats={computedDetailedStats}
          variant={computedVariant}
          className=""
        />
      ))}
    </div>
  );
};

export default EnhancedPlayersList;

