
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause } from "lucide-react";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import PlayerStatusBadge from "@/components/ui/player-status-badge";
import { getCurrentHalfTime } from "@/utils/timeUtils";
import { useTranslation } from "@/hooks/useTranslation";

interface TrackedPlayerCardProps {
  player: PlayerTime;
  playerInfo?: ProcessedPlayer;
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  trackedPlayers?: PlayerTime[];
  matchTime?: number;
}

const TrackedPlayerCard = ({
  player,
  playerInfo,
  formatTime,
  onTogglePlayerTime,
  matchTime = 0
}: TrackedPlayerCardProps) => {
  const { t } = useTranslation();
  const role = playerInfo?.role || 'Starter';

  // Calculate current half time for status badge
  const currentHalfTime = getCurrentHalfTime(matchTime);
  
  // Calculate total playing time
  const currentPlayingTime = player.isPlaying && player.startTime !== null 
    ? matchTime - player.startTime 
    : 0;
  const totalTime = player.totalTime + currentPlayingTime;

  console.log('👤 Rendering tracked player:', {
    name: player.name,
    role,
    isPlaying: player.isPlaying,
    totalTime: player.totalTime,
    currentPlayingTime,
    combinedTime: totalTime
  });

  return (
    <div className={`p-2 sm:p-3 rounded-md border bg-card hover:shadow-sm transition-all ${
      !player.isPlaying ? 'opacity-60 bg-muted/30' : 'opacity-100'
    }`}>
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Player number */}
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {playerInfo?.number || '?'}
        </div>

        {/* Player info */}
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

        {/* Timer and Status Display */}
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <div className="font-mono text-sm sm:text-base font-bold leading-tight">
            {formatTime(totalTime)}
          </div>
          
          {/* Player Status Badge */}
          <PlayerStatusBadge
            role={role}
            totalTime={totalTime}
            currentHalfTime={currentHalfTime}
            isPlaying={player.isPlaying}
            matchTime={matchTime}
            className="hidden sm:flex"
          />
        </div>

        {/* Action button */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant={player.isPlaying ? "destructive" : "default"}
            onClick={() => onTogglePlayerTime(player.id)}
            className="h-7 px-2 text-xs"
          >
            {player.isPlaying ? (
              <>
                <Pause className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">{t("referee.action.stop", "Stop")}</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">{t("referee.action.start", "Start")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile-only status display */}
      <div className="sm:hidden mt-2">
        <PlayerStatusBadge
          role={role}
          totalTime={totalTime}
          currentHalfTime={currentHalfTime}
          isPlaying={player.isPlaying}
          matchTime={matchTime}
        />
      </div>
    </div>
  );
};

export default TrackedPlayerCard;
