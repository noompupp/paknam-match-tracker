
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMinus } from "lucide-react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import { canRemovePlayer } from "./playerValidationUtils";

interface TrackedPlayerCardProps {
  player: PlayerTime;
  playerInfo?: ProcessedPlayer;
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
  trackedPlayers?: PlayerTime[]; // Added for validation
}

const TrackedPlayerCard = ({
  player,
  playerInfo,
  formatTime,
  onTogglePlayerTime,
  onRemovePlayer,
  trackedPlayers = []
}: TrackedPlayerCardProps) => {
  const role = playerInfo?.role || 'Starter';
  
  // Check if player can be removed
  const removal = canRemovePlayer(player.id, trackedPlayers);
  
  console.log('👤 Rendering tracked player:', {
    name: player.name,
    role,
    canRemove: removal.canRemove,
    isPlaying: player.isPlaying
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
          </div>
        </div>

        {/* Inline timer display */}
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-sm sm:text-base font-bold leading-tight">
            {formatTime(player.totalTime)}
          </div>
          <div className="text-xs text-muted-foreground leading-none hidden sm:block">
            {role === 'S-class' && '20min/half'}
            {role === 'Starter' && '10min min'}
            {role === 'Captain' && 'No limit'}
          </div>
        </div>

        {/* Compact action buttons */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant={player.isPlaying ? "destructive" : "default"}
            onClick={() => onTogglePlayerTime(player.id)}
            className="h-7 px-2 text-xs"
          >
            <span className="hidden sm:inline">
              {player.isPlaying ? "Sub Out" : "Sub In"}
            </span>
            <span className="sm:hidden">
              {player.isPlaying ? "Out" : "In"}
            </span>
          </Button>
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

      {/* Mobile role constraints and removal warnings */}
      <div className="sm:hidden mt-1">
        <p className="text-xs text-muted-foreground leading-none">
          {role === 'S-class' && 'Max 20min per half'}
          {role === 'Starter' && 'Min 10min total'}
          {role === 'Captain' && 'No time limits'}
        </p>
        {!removal.canRemove && (
          <p className="text-xs text-red-500 mt-1 leading-none">
            {removal.reason}
          </p>
        )}
      </div>
    </div>
  );
};

export default TrackedPlayerCard;
