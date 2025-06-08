
import TrackedPlayerCard from "./TrackedPlayerCard";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface TrackedPlayersListProps {
  trackedPlayers: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
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
  onRemovePlayer,
  matchTime = 0,
  pendingSubstitutionPlayerId = null,
  substitutionManager
}: TrackedPlayersListProps) => {
  if (trackedPlayers.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p className="text-sm">No players currently tracked</p>
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
            onRemovePlayer={onRemovePlayer}
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
