
import { cn } from "@/lib/utils";
import { PlayerAvatarProps } from "./types";
import { usePlayerAvatarState } from "./hooks/usePlayerAvatarState";
import { getTeamColors } from "./utils/teamColorUtils";
import { sizeClasses } from "./utils/styleUtils";
import AvatarFront from "./components/AvatarFront";
import AvatarBack from "./components/AvatarBack";
import FlipIndicator from "./components/FlipIndicator";

const PlayerAvatar = ({ 
  player, 
  team,
  size = "medium", 
  showStats = true,
  className,
  autoFlip = false,
  disabled = false
}: PlayerAvatarProps) => {
  const { isFlipped, handleAvatarClick, handleKeyDown } = usePlayerAvatarState(autoFlip, disabled);
  const teamColors = getTeamColors(team);

  return (
    <div 
      className={cn(
        "relative flex-shrink-0 avatar-container focus:outline-none",
        !disabled && "cursor-pointer",
        disabled && "opacity-60 cursor-not-allowed",
        sizeClasses[size],
        className
      )}
      onClick={handleAvatarClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`${player.name || 'Player'} avatar - ${isFlipped ? 'showing jersey number' : 'showing profile'}`}
      aria-pressed={isFlipped}
    >
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-400 ease-out transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Front Side - Avatar or Player Number Badge */}
        <AvatarFront player={player} size={size} />

        {/* Back Side - Enhanced Team Jersey with Number */}
        <AvatarBack player={player} size={size} teamColors={teamColors} />
      </div>

      {/* Enhanced flip indicator with team color */}
      <FlipIndicator isFlipped={isFlipped} teamColors={teamColors} />

      {/* Loading state overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center">
          <div 
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: teamColors.primary }}
          />
        </div>
      )}
    </div>
  );
};

export default PlayerAvatar;
