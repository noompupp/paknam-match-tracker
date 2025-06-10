
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

  // Enhanced team color system with intelligent contrast
  const getTeamColors = () => {
    const defaultColors = {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      contrast: '#ffffff'
    };

    if (!team?.color) return defaultColors;

    // Convert hex to RGB for calculations
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 59, g: 130, b: 246 };
    };

    // Calculate luminance for contrast decisions
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    // Generate contrasting colors
    const rgb = hexToRgb(team.color);
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    
    // Smart contrast selection
    const textColor = luminance > 0.5 ? '#000000' : '#ffffff';
    const shadowColor = luminance > 0.5 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    
    // Generate secondary colors
    const darkenFactor = luminance > 0.7 ? 0.3 : 0.2;
    const lightenFactor = luminance < 0.3 ? 0.3 : 0.2;
    
    const secondary = `rgb(${Math.max(0, rgb.r - rgb.r * darkenFactor)}, ${Math.max(0, rgb.g - rgb.g * darkenFactor)}, ${Math.max(0, rgb.b - rgb.b * darkenFactor)})`;
    const accent = `rgb(${Math.min(255, rgb.r + (255 - rgb.r) * lightenFactor)}, ${Math.min(255, rgb.g + (255 - rgb.g) * lightenFactor)}, ${Math.min(255, rgb.b + (255 - rgb.b) * lightenFactor)})`;

    return {
      primary: team.color,
      secondary,
      accent,
      contrast: textColor,
      shadow: shadowColor
    };
  };

  const teamColors = getTeamColors();

  // Advanced jersey background with multiple patterns
  const getJerseyStyle = () => {
    const baseGradient = `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 60%, ${teamColors.accent} 100%)`;
    
    return {
      background: baseGradient,
      boxShadow: `
        0 0 20px ${teamColors.primary}40,
        inset 0 2px 4px rgba(255, 255, 255, 0.1),
        inset 0 -2px 4px rgba(0, 0, 0, 0.1)
      `,
      position: 'relative' as const,
      overflow: 'hidden' as const
    };
  };

  // Enhanced number typography based on size
  const getNumberTypography = () => {
    const baseStyles = "font-black leading-none tracking-tight relative z-20";
    
    switch (size) {
      case "small":
        return cn(baseStyles, "text-xs", "drop-shadow-sm");
      case "medium":
        return cn(baseStyles, "text-lg", "drop-shadow-md");
      case "large":
        return cn(baseStyles, "text-2xl", "drop-shadow-lg");
      default:
        return cn(baseStyles, "text-lg", "drop-shadow-md");
    }
  };

  // Advanced football pattern background
  const getFootballPattern = () => {
    const patternSize = size === "small" ? "6px" : size === "medium" ? "8px" : "10px";
    const opacity = "0.15";
    
    return {
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(255,255,255,${opacity}) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,${opacity}) 1px, transparent 1px),
        linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%)
      `,
      backgroundSize: `${patternSize} ${patternSize}, ${patternSize} ${patternSize}, ${patternSize} ${patternSize}, ${patternSize} ${patternSize}`,
      backgroundPosition: '0 0, 0 0, 0 0, 0 0'
    };
  };

  // Dynamic flip indicator color
  const getFlipIndicatorStyle = () => ({
    backgroundColor: teamColors.primary,
    color: teamColors.contrast,
    boxShadow: `0 0 8px ${teamColors.primary}60`
  });

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

        {/* Back Side - Enhanced Team Jersey with Number */}
        <div 
          className={cn(
            "absolute inset-0 backface-hidden rotate-y-180 rounded-full border-2 flex items-center justify-center shadow-lg",
            sizeClasses[size]
          )}
          style={{
            ...getJerseyStyle(),
            color: teamColors.contrast,
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Advanced Football Pattern Overlay */}
          <div 
            className="absolute inset-0 rounded-full"
            style={getFootballPattern()}
          />
          
          {/* Enhanced Gradient Overlays */}
          <div className="absolute inset-0 rounded-full">
            {/* Main gradient overlay */}
            <div 
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)`
              }}
            />
            
            {/* Highlight effect */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)`
              }}
            />
            
            {/* Depth shadow */}
            <div 
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: `radial-gradient(ellipse at 70% 70%, transparent 30%, rgba(0,0,0,0.3) 100%)`
              }}
            />
          </div>
          
          {/* Player Number with Enhanced Typography */}
          <div className="relative z-20 text-center">
            <div 
              className={getNumberTypography()}
              style={{ 
                color: teamColors.contrast,
                textShadow: `
                  0 2px 4px ${teamColors.shadow},
                  0 0 8px rgba(0,0,0,0.3),
                  1px 1px 0 rgba(0,0,0,0.2),
                  -1px -1px 0 rgba(255,255,255,0.1)
                `
              }}
            >
              {displayNumber}
            </div>
            
            {/* Number highlight effect */}
            <div 
              className="absolute inset-0 rounded opacity-20"
              style={{
                background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`
              }}
            />
          </div>
          
          {/* Jersey seam details */}
          <div className="absolute inset-2 border border-white/10 rounded-full" />
          <div className="absolute inset-4 border border-white/5 rounded-full" />
        </div>
      </div>

      {/* Enhanced flip indicator with team color */}
      <div 
        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-background/50 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
        style={getFlipIndicatorStyle()}
      >
        <span className="text-[8px] font-bold">
          {isFlipped ? '🔄' : '↻'}
        </span>
      </div>

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
