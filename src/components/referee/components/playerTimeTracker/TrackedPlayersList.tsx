
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import TrackedPlayerCard from "./TrackedPlayerCard";

interface TrackedPlayersListProps {
  trackedPlayers: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
}

const TrackedPlayersList = ({
  trackedPlayers,
  allPlayers,
  formatTime,
  onTogglePlayerTime,
  onRemovePlayer
}: TrackedPlayersListProps) => {
  if (trackedPlayers.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">No players being tracked</p>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Tracked Players ({trackedPlayers.length})</h4>
      {trackedPlayers.map((player) => {
        const playerInfo = allPlayers.find(p => p.id === player.id);
        
        return (
          <TrackedPlayerCard
            key={player.id}
            player={player}
            playerInfo={playerInfo}
            formatTime={formatTime}
            onTogglePlayerTime={onTogglePlayerTime}
            onRemovePlayer={onRemovePlayer}
          />
        );
      })}
    </div>
  );
};

export default TrackedPlayersList;
