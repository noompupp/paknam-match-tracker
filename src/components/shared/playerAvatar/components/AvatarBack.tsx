
import { Member } from "@/types/database";
import { cn } from "@/lib/utils";
import { TeamColors } from "../types";
import { sizeClasses, getJerseyStyle, getNumberTypography, getFootballPattern } from "../utils/styleUtils";

interface AvatarBackProps {
  player: Member;
  size: keyof typeof sizeClasses;
  teamColors: TeamColors;
}

const AvatarBack = ({ player, size, teamColors }: AvatarBackProps) => {
  const displayNumber = player.number || '?';

  return (
    <div 
      className={cn(
        "absolute inset-0 backface-hidden rotate-y-180 rounded-full border-2 flex items-center justify-center shadow-lg",
        sizeClasses[size]
      )}
      style={{
        ...getJerseyStyle(teamColors),
        color: teamColors.contrast,
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Advanced Football Pattern Overlay */}
      <div 
        className="absolute inset-0 rounded-full"
        style={getFootballPattern(size)}
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
          className={getNumberTypography(size)}
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
  );
};

export default AvatarBack;
