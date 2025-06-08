
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMinus } from "lucide-react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import PlayerStatusBadge from "@/components/ui/player-status-badge";
import { canRemovePlayer, validateSubstitution } from "./playerValidationUtils";
import { isSecondHalf, getCurrentHalfTime } from "@/utils/timeUtils";

interface TrackedPlayerCardProps {
  player: PlayerTime;
  playerInfo?: ProcessedPlayer;
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
  trackedPlayers?: PlayerTime[];
  matchTime?: number;
}

const TrackedPlayerCard = ({
  player,
  playerInfo,
  formatTime,
  onTogglePlayerTime,
  onRemovePlayer,
  trackedPlayers = [],
  matchTime = 0
}: TrackedPlayerCardProps) => {
  const role = playerInfo?.role || 'Starter';
  
  // Enhanced validation checks
  const removal = canRemovePlayer(player.id, trackedPlayers);
  const toggleValidation = validateSubstitution('toggle', player.id, trackedPlayers);
  
  // Calculate current half time for status badge
  const currentHalfTime = getCurrentHalfTime(matchTime);
  
  // Determine button appearance based on validation
  const getToggleButtonProps = () => {
    const baseProps = {
      size: "sm" as const,
      className: "h-7 px-2 text-xs",
      onClick: () => onTogglePlayerTime(player.id)
    };

    if (player.isPlaying) {
      return {
        ...baseProps,
        variant: "destructive" as const,
        children: (
          <>
            <span className="hidden sm:inline">Sub Out</span>
            <span className="sm:hidden">Out</span>
          </>
        ),
        title: toggleValidation.requiresSubstitution 
          ? "Will require substitution - field cannot go below 7 players"
          : "Substitute player out"
      };
    } else {
      const isFieldFull = trackedPlayers.filter(p => p.isPlaying).length >= 7;
      const isReSubstitution = toggleValidation.isReSubstitution;
      
      return {
        ...baseProps,
        variant: isFieldFull ? "outline" as const : "default" as const,
        children: (
          <>
            <span className="hidden sm:inline">
              {isReSubstitution ? "Re-Sub In" : "Sub In"}
            </span>
            <span className="sm:hidden">
              {isReSubstitution ? "Re-In" : "In"}
            </span>
          </>
        ),
        title: isFieldFull 
          ? isReSubstitution 
            ? "Field is full - will require another player to be substituted out first"
            : "Field is full - will require substitution"
          : isReSubstitution 
            ? "Re-substitute player in"
            : "Substitute player in",
        disabled: isFieldFull && !toggleValidation.canSubIn
      };
    }
  };

  const toggleButtonProps = getToggleButtonProps();

  console.log('👤 Enhanced tracked player card:', {
    name: player.name,
    role,
    canRemove: removal.canRemove,
    isPlaying: player.isPlaying,
    toggleValidation: toggleValidation.actionType,
    requiresSubstitution: toggleValidation.requiresSubstitution,
    isReSubstitution: toggleValidation.isReSubstitution
  });

  return (
    <div className="p-2 sm:p-3 rounded-md border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Compact player number */}
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {playerInfo?.number || '?'}
        </div>

        {/* Player info - optimized for space */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-medium text-sm truncate">{player.name}</span>
            <PlayerRoleBadge role={role} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground truncate">{player.team}</span>
            <Badge 
              variant={player.isPlaying ? "default" : "secondary"} 
              className="text-xs px-1.5 py-0 h-4"
            >
              {player.isPlaying ? "ON" : "OFF"}
            </Badge>
            {toggleValidation.requiresSubstitution && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                SUB REQ
              </Badge>
            )}
            {toggleValidation.isReSubstitution && !player.isPlaying && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-blue-50">
                RE-SUB
              </Badge>
            )}
          </div>
        </div>

        {/* Timer and Status Display */}
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <div className="font-mono text-sm sm:text-base font-bold leading-tight">
            {formatTime(player.totalTime)}
          </div>
          
          {/* Dynamic Player Status Badge */}
          <PlayerStatusBadge
            role={role}
            totalTime={player.totalTime}
            currentHalfTime={currentHalfTime}
            isPlaying={player.isPlaying}
            matchTime={matchTime}
            className="hidden sm:flex"
          />
        </div>

        {/* Enhanced action buttons with validation feedback */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            {...toggleButtonProps}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemovePlayer(player.id)}
            className="h-7 w-7 p-0"
            disabled={!removal.canRemove}
            title={!removal.canRemove ? removal.reason : 'Remove player from squad'}
          >
            <UserMinus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Mobile-only status display */}
      <div className="sm:hidden mt-2 flex items-center gap-2">
        <PlayerStatusBadge
          role={role}
          totalTime={player.totalTime}
          currentHalfTime={currentHalfTime}
          isPlaying={player.isPlaying}
          matchTime={matchTime}
        />
        {toggleValidation.isReSubstitution && !player.isPlaying && (
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-blue-50">
            Available for Re-substitution
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TrackedPlayerCard;
