
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Member, Team } from "@/types/database";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  player: Member;
  team?: Team;
  size?: "small" | "medium" | "large";
  showStats?: boolean;
  className?: string;
  autoFlip?: boolean;
  disabled?: boolean;
}

const PlayerAvatar = ({ 
  player, 
  team,
  size = "medium", 
  showStats = true,
  className,
  autoFlip = false,
  disabled = false
}: PlayerAvatarProps) => {
  const [isFlipped, setIsFlipped] = useState(autoFlip);

  const sizeClasses = {
    small: "w-8 h-8 text-xs",
    medium: "w-12 h-12 text-sm", 
    large: "w-16 h-16 text-base"
  };

  const badgeSizeClasses = {
    small: "w-6 h-6 text-xs",
    medium: "w-8 h-8 text-sm",
    large: "w-10 h-10 text-base"
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    if (disabled) return;
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  // Get display number with fallback
  const displayNumber = player.number || '?';

  // Get team-specific colors with fallbacks
  const getTeamColors = () => {
    const defaultColors = {
      primary: '#3b82f6', // blue-500
      secondary: '#1e40af', // blue-700
      accent: '#60a5fa' // blue-400
    };

    if (!team?.color) return defaultColors;

    // Convert hex to HSL for better color manipulation
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return { h: h * 360, s: s * 100, l: l * 100 };
    };

    const hsl = hexToHsl(team.color);
    
    return {
      primary: team.color,
      secondary: `hsl(${hsl.h}, ${Math.min(hsl.s + 10, 100)}%, ${Math.max(hsl.l - 15, 10)}%)`,
      accent: `hsl(${hsl.h}, ${Math.max(hsl.s - 20, 30)}%, ${Math.min(hsl.l + 10, 90)}%)`
    };
  };

  const teamColors = getTeamColors();

  // Enhanced jersey background with team colors
  const getJerseyStyle = () => ({
    background: `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 60%, ${teamColors.accent} 100%)`,
    boxShadow: `0 0 20px ${teamColors.primary}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
  });

  // Number size based on jersey size
  const getNumberSize = () => {
    switch (size) {
      case "small":
        return "text-sm";
      case "medium":
        return "text-xl";
      case "large":
        return "text-3xl";
      default:
        return "text-xl";
    }
  };

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
        <div className="absolute inset-0 backface-hidden">
          {player.ProfileURL ? (
            <Avatar className={cn(sizeClasses[size], "border-2 border-primary/20")}>
              <AvatarImage src={player.ProfileURL} alt={player.name || 'Player'} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                {getPlayerInitials(player.name || 'Player')}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Badge 
              variant="outline" 
              className={cn(
                badgeSizeClasses[size],
                "rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-primary/20 to-primary/10 border-primary/20 text-primary"
              )}
            >
              {displayNumber}
            </Badge>
          )}
        </div>

        {/* Back Side - Team Jersey with Number */}
        <div 
          className={cn(
            "absolute inset-0 backface-hidden rotate-y-180 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden",
            sizeClasses[size]
          )}
          style={getJerseyStyle()}
        >
          {/* Jersey pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
            {/* Subtle football texture */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '8px 8px'
            }}></div>
          </div>
          
          {/* Player Number */}
          <div className="relative z-10 text-center">
            <div className={cn(
              "font-black leading-none tracking-tight drop-shadow-lg",
              getNumberSize()
            )}>
              {displayNumber}
            </div>
            {/* Subtle highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-30 rounded"></div>
          </div>
        </div>
      </div>

      {/* Enhanced flip indicator with team color */}
      <div 
        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-background flex items-center justify-center transition-colors duration-200"
        style={{ backgroundColor: teamColors.primary }}
      >
        <span className="text-[8px] text-white font-bold drop-shadow">
          {isFlipped ? '🔄' : '↻'}
        </span>
      </div>

      {/* Loading state overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default PlayerAvatar;
