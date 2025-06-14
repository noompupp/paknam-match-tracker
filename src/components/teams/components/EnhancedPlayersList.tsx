
import EnhancedPlayerCard from "./EnhancedPlayerCard";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

// Accepts 'players', 'isLoading', etc. as props
const EnhancedPlayersList = ({
  players,
  isLoading,
  showDetailedStats = false,
  variant = 'default',
}) => {
  const { isMobile, isPortrait } = useDeviceOrientation();

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

  // Desktop/tablet: show full cards. Mobile portrait: show compact cards.
  return (
    <div
      className={
        isMobile && isPortrait
          ? "space-y-3"
          : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      }
    >
      {players?.map((player, idx) => (
        <EnhancedPlayerCard
          key={player.id}
          player={player}
          showDetailedStats={showDetailedStats && !isMobile}
          variant={
            isMobile && isPortrait
              ? "compact"
              : "default"
          }
          className=""
        />
      ))}
    </div>
  );
};

export default EnhancedPlayersList;
