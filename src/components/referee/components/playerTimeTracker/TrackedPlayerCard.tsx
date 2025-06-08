
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
  const role = playerInfo?.role || 'Starter'; // Use role field instead of position
  
  console.log('👤 Rendering tracked player:', {
    name: player.name,
    role,
    playerInfo: !!playerInfo
  });

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
            {playerInfo?.number || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{player.name}</span>
              <PlayerRoleBadge role={role} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">{player.team}</p>
            <Badge variant={player.isPlaying ? "default" : "secondary"} className="text-xs">
              {player.isPlaying ? "ON FIELD" : "OFF FIELD"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono text-lg font-bold">
              {formatTime(player.totalTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {role === 'S-class' && 'Max 20min/half'}
              {role === 'Starter' && 'Min 10min total'}
              {role === 'Captain' && 'No limits'}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={player.isPlaying ? "destructive" : "default"}
              onClick={() => onTogglePlayerTime(player.id)}
            >
              {player.isPlaying ? "Sub Out" : "Sub In"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemovePlayer(player.id)}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackedPlayerCard;
