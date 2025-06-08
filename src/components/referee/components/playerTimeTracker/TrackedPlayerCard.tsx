
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMinus, ArrowRightLeft } from "lucide-react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import PlayerStatusBadge from "@/components/ui/player-status-badge";
import { canRemovePlayer } from "./playerValidationUtils";
import { isSecondHalf, getCurrentHalfTime } from "@/utils/timeUtils";

interface TrackedPlayerCardProps {
  player: PlayerTime;
  playerInfo?: ProcessedPlayer;
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
  trackedPlayers?: PlayerTime[];
  matchTime?: number;
  isPendingSubstitution?: boolean;
}

const TrackedPlayerCard = ({
  player,
  playerInfo,
  formatTime,
  onTogglePlayerTime,
  onRemovePlayer,
  trackedPlayers = [],
  matchTime = 0,
  isPendingSubstitution = false
}: TrackedPlayerCardProps) => {
  const role = playerInfo?.role || 'Starter';
  
  // Check if player can be removed
  const removal = canRemovePlayer(player.id, trackedPlayers);
  
  // Calculate current half time for status badge
  const currentHalfTime = getCurrentHalfTime(matchTime);
  
  // Check if this is a player who has played before (potential substitution candidate)
  const hasPlayedBefore = player.totalTime > 0;
  const isSubstitutionCandidate = player.isPlaying && hasPlayedBefore;
  
  console.log('👤 Rendering tracked player with substitution status:', {
    name: player.name,
    role,
    canRemove: removal.canRemove,
    isPlaying: player.isPlaying,
    hasPlayedBefore,
    isSubstitutionCandidate,
    isPendingSubstitution,
    currentHalfTime,
    totalTime: player.totalTime
  });

  // Determine button text and styling
  const getButtonProps = () => {
    if (isPendingSubstitution) {
      return {
        text: "Pending Sub",
        variant: "outline" as const,
        icon: <ArrowRightLeft className="h-3 w-3" />
      };
    }
    
    if (isSubstitutionCandidate) {
      return {
        text: player.isPlaying ? "Sub Out" : "Sub In",
        variant: (player.isPlaying ? "destructive" : "default") as const,
        icon: <ArrowRightLeft className="h-3 w-3" />
      };
    }
    
    return {
      text: player.isPlaying ? "Stop" : "Start",
      variant: (player.isPlaying ? "destructive" : "default") as const,
      icon: null
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className={`p-2 sm:p-3 rounded-md border bg-card hover:shadow-sm transition-all ${
      isPendingSubstitution ? 'border-orange-300 bg-orange-50/50' : ''
    }`}>
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
            {isPendingSubstitution && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-orange-300 text-orange-700">
                Pending Sub
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground truncate">{player.team}</span>
            <Badge 
              variant={player.isPlaying ? "default" : "secondary"} 
              className="text-xs px-1.5 py-0 h-4"
            >
              {player.isPlaying ? "ON" : "OFF"}
            </Badge>
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

        {/* Compact action buttons */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant={buttonProps.variant}
            onClick={() => onTogglePlayerTime(player.id)}
            className="h-7 px-2 text-xs"
            disabled={isPendingSubstitution}
          >
            {buttonProps.icon && (
              <span className="sm:hidden mr-1">
                {buttonProps.icon}
              </span>
            )}
            <span className="hidden sm:inline">
              {buttonProps.text}
            </span>
            <span className="sm:hidden">
              {buttonProps.text.split(' ')[0]}
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemovePlayer(player.id)}
            className="h-7 w-7 p-0"
            disabled={!removal.canRemove || isPendingSubstitution}
            title={!removal.canRemove ? removal.reason : 'Remove player from squad'}
          >
            <UserMinus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Mobile-only status display */}
      <div className="sm:hidden mt-2">
        <PlayerStatusBadge
          role={role}
          totalTime={player.totalTime}
          currentHalfTime={currentHalfTime}
          isPlaying={player.isPlaying}
          matchTime={matchTime}
        />
      </div>
    </div>
  );
};

export default TrackedPlayerCard;
