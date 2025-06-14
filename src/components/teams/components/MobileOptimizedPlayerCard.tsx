
import { Member, Team } from "@/types/database";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import MobileCompactPlayerCard from "./MobileCompactPlayerCard";
import MobileLandscapePlayerCard from "./MobileLandscapePlayerCard";
import DesktopPlayerCard from "./DesktopPlayerCard";

interface MobileOptimizedPlayerCardProps {
  player: Member;
  teamData?: Team;
  index: number;
  isTopScorer?: boolean;
  isTopAssister?: boolean;
  variant?: 'default' | 'compact';
}

const MobileOptimizedPlayerCard = ({
  player,
  teamData,
  index,
  isTopScorer = false,
  isTopAssister = false,
  variant = 'default'
}: MobileOptimizedPlayerCardProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();

  // Helper derived booleans:
  const hasStats = (player.goals || 0) > 0 || (player.assists || 0) > 0 || (player.total_minutes_played || 0) > 0;
  const hasExtendedStats = (player.yellow_cards || 0) > 0 || (player.red_cards || 0) > 0 || (player.total_minutes_played || 0) > 0;

  if (isMobile && isPortrait && variant === 'compact') {
    return (
      <MobileCompactPlayerCard
        player={player}
        teamData={teamData}
        index={index}
        isTopScorer={isTopScorer}
        isTopAssister={isTopAssister}
      />
    );
  }

  if (isMobile && !isPortrait) {
    return (
      <MobileLandscapePlayerCard
        player={player}
        teamData={teamData}
        index={index}
        isTopScorer={isTopScorer}
        isTopAssister={isTopAssister}
      />
    );
  }

  // Default: Desktop and expandable mobile
  return (
    <DesktopPlayerCard
      player={player}
      teamData={teamData}
      index={index}
      isMobile={isMobile}
      hasStats={hasStats}
      hasExtendedStats={hasExtendedStats}
      isTopScorer={isTopScorer}
      isTopAssister={isTopAssister}
    />
  );
};

export default MobileOptimizedPlayerCard;
