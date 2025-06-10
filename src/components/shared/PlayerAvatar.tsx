
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Member } from "@/types/database";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  player: Member;
  size?: "small" | "medium" | "large";
  showStats?: boolean;
  className?: string;
}

const PlayerAvatar = ({ 
  player, 
  size = "medium", 
  showStats = true,
  className 
}: PlayerAvatarProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

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
    if (showStats && ((player.goals || 0) > 0 || (player.assists || 0) > 0)) {
      setIsFlipped(!isFlipped);
    }
  };

  const hasStats = showStats && ((player.goals || 0) > 0 || (player.assists || 0) > 0);

  return (
    <div 
      className={cn(
        "relative flex-shrink-0 cursor-pointer avatar-container",
        sizeClasses[size],
        className
      )}
      onClick={handleAvatarClick}
      style={{ perspective: "1000px" }}
    >
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Front Side - Avatar or Number */}
        <div className="absolute inset-0 backface-hidden">
          {player.picture ? (
            <Avatar className={cn(sizeClasses[size], "border-2 border-primary/20")}>
              <AvatarImage src={player.picture} alt={player.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                {getPlayerInitials(player.name)}
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
              {player.number || '?'}
            </Badge>
          )}
        </div>

        {/* Back Side - Stats */}
        {hasStats && (
          <div className={cn(
            "absolute inset-0 backface-hidden rotate-y-180 rounded-full bg-gradient-to-br from-green-500/90 to-blue-500/90 border-2 border-white/20 flex flex-col items-center justify-center text-white font-bold shadow-lg",
            sizeClasses[size]
          )}>
            <div className="text-center">
              <div className="text-xs leading-tight">
                {(player.goals || 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">⚽</span>
                    <span>{player.goals}</span>
                  </div>
                )}
                {(player.assists || 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">🅰️</span>
                    <span>{player.assists}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flip indicator for players with stats */}
      {hasStats && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border border-background flex items-center justify-center">
          <span className="text-[8px] text-primary-foreground">↻</span>
        </div>
      )}
    </div>
  );
};

export default PlayerAvatar;
