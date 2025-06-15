
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface MobilePlayerGridProps {
  players: ComponentPlayer[];
  onPlayerSelect: (player: ComponentPlayer) => void;
  variant?: "primary" | "secondary";
  title?: string;
}

const MobilePlayerGrid = ({
  players,
  onPlayerSelect,
  variant = "primary",
  title
}: MobilePlayerGridProps) => {
  const buttonVariant = variant === "primary" ? "outline" : "ghost";
  const hoverClass = variant === "primary" 
    ? "hover:bg-green-50 hover:border-green-300" 
    : "hover:bg-orange-50 hover:border-orange-300";

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="font-medium text-sm text-muted-foreground">
          {title}
        </h4>
      )}
      
      <div className="grid gap-2 max-h-60 overflow-y-auto">
        {players.map((player) => (
          <Button
            key={`${variant}-player-${player.id}`}
            onClick={() => onPlayerSelect(player)}
            variant={buttonVariant}
            className={`justify-start h-auto p-3 w-full ${hoverClass} border border-transparent`}
          >
            <div className="flex items-center gap-3 w-full min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                variant === "primary" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-orange-100 text-orange-700"
              }`}>
                {player.number || '?'}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-medium truncate">{player.name}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {player.team}
                </div>
              </div>
              {variant === "secondary" && (
                <Badge variant="destructive" className="text-xs flex-shrink-0">
                  Own Goal
                </Badge>
              )}
              {variant === "primary" && (
                <Badge variant="outline" className="text-green-700 border-green-300 text-xs flex-shrink-0">
                  Regular
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobilePlayerGrid;
