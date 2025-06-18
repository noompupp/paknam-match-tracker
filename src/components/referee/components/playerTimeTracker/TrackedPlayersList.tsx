
import TrackedPlayerCard from "./TrackedPlayerCard";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useTranslation } from "@/hooks/useTranslation";

interface TrackedPlayersListProps {
  trackedPlayers: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  matchTime?: number;
}

const TrackedPlayersList = ({
  trackedPlayers,
  allPlayers,
  formatTime,
  onTogglePlayerTime,
  matchTime = 0
}: TrackedPlayersListProps) => {
  const { t } = useTranslation();

  if (trackedPlayers.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p className="text-sm">{t("referee.noPlayersTrackedSection", "No players currently tracked")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trackedPlayers.map((player) => {
        const playerInfo = allPlayers.find(p => p.id === player.id);
        
        return (
          <TrackedPlayerCard
            key={player.id}
            player={player}
            playerInfo={playerInfo}
            formatTime={formatTime}
            onTogglePlayerTime={onTogglePlayerTime}
            trackedPlayers={trackedPlayers}
            matchTime={matchTime}
          />
        );
      })}
    </div>
  );
};

export default TrackedPlayersList;
