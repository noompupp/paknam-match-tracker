import TrackedPlayerCard from "./TrackedPlayerCard";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useTranslation } from "@/hooks/useTranslation";

interface TrackedPlayersListProps {
  trackedPlayers: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  // onRemovePlayer prop removed
  matchTime?: number;
  pendingSubstitutionPlayerId?: number | null;
  substitutionManager?: {
    pendingSubstitution: any;
    hasPendingSubstitution: boolean;
    isSubOutInitiated: boolean;
  };
}

const TrackedPlayersList = ({
  trackedPlayers,
  allPlayers,
  formatTime,
  onTogglePlayerTime,
  // Removed onRemovePlayer from destructure
  matchTime = 0,
  pendingSubstitutionPlayerId = null,
  substitutionManager
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
        const isPendingSubstitution = pendingSubstitutionPlayerId === player.id;
        
        return (
          <TrackedPlayerCard
            key={player.id}
            player={player}
            playerInfo={playerInfo}
            formatTime={formatTime}
            onTogglePlayerTime={onTogglePlayerTime}
            // Removed onRemovePlayer
            trackedPlayers={trackedPlayers}
            matchTime={matchTime}
            isPendingSubstitution={isPendingSubstitution}
            substitutionManager={substitutionManager}
          />
        );
      })}
    </div>
  );
};

export default TrackedPlayersList;
