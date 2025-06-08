
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMinus } from "lucide-react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import PlayerRoleBadge from "@/components/ui/player-role-badge";

interface TrackedPlayerCardProps {
  player: PlayerTime;
  playerInfo?: ProcessedPlayer;
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
}

const TrackedPlayerCard = ({
  player,
  playerInfo,
  formatTime,
  onTogglePlayerTime,
  onRemovePlayer
}: TrackedPlayerCardProps) => {
  const role = playerInfo?.role || 'Starter';
  
  console.log('👤 Rendering tracked player:', {
    name: player.name,
    role,
    playerInfo: !!playerInfo
  });

  return (
    <div className="p-2 sm:p-3 rounded-md border bg-card hover:shadow-sm transition-shadow">
      {/* Ultra-compact single row layout */}
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
              {player.isPlaying ? "Out" : "In"}
            </span>
            <span className="sm:hidden">
              {player.isPlaying ? "−" : "+"}
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemovePlayer(player.id)}
            className="h-7 w-7 p-0"
          >
            <UserMinus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Mobile role constraints - only show when space is critical */}
      <div className="sm:hidden mt-1">
        <p className="text-xs text-muted-foreground leading-none">
          {role === 'S-class' && 'Max 20min per half'}
          {role === 'Starter' && 'Min 10min total'}
          {role === 'Captain' && 'No time limits'}
        </p>
      </div>
    </div>
  );
};

export default TrackedPlayerCard;
