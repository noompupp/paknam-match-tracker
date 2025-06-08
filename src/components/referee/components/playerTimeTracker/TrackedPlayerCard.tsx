
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
    <div className="p-3 sm:p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      {/* Mobile-first responsive layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Player Info Section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-primary flex-shrink-0">
            {playerInfo?.number || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-sm sm:text-base truncate">{player.name}</span>
              <PlayerRoleBadge role={role} size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{player.team}</p>
            <Badge variant={player.isPlaying ? "default" : "secondary"} className="text-xs mt-1">
              {player.isPlaying ? "ON FIELD" : "OFF FIELD"}
            </Badge>
          </div>
        </div>

        {/* Time and Controls Section */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          
          {/* Time Display */}
          <div className="text-right flex-shrink-0">
            <div className="font-mono text-base sm:text-lg font-bold">
              {formatTime(player.totalTime)}
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {role === 'S-class' && 'Max 20min/half'}
              {role === 'Starter' && 'Min 10min total'}
              {role === 'Captain' && 'No limits'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant={player.isPlaying ? "destructive" : "default"}
              onClick={() => onTogglePlayerTime(player.id)}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              {/* Responsive button text */}
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
              className="px-2"
            >
              <UserMinus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-only role constraints hint */}
      <div className="sm:hidden mt-2">
        <p className="text-xs text-muted-foreground">
          {role === 'S-class' && 'Max 20min/half'}
          {role === 'Starter' && 'Min 10min total'}
          {role === 'Captain' && 'No limits'}
        </p>
      </div>
    </div>
  );
};

export default TrackedPlayerCard;
