
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import TrackedPlayerCard from "./TrackedPlayerCard";

interface TrackedPlayersListProps {
  trackedPlayers: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
  matchTime?: number;
}

const TrackedPlayersList = ({
  trackedPlayers,
  allPlayers,
  formatTime,
  onTogglePlayerTime,
  onRemovePlayer,
  matchTime = 0
}: TrackedPlayersListProps) => {
  if (trackedPlayers.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-3 text-sm">No players being tracked</p>
    );
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h4 className="font-semibold text-sm mb-2">
        Tracked Players ({trackedPlayers.length})
      </h4>
      <div className="space-y-1.5">
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
              trackedPlayers={trackedPlayers}
              matchTime={matchTime}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrackedPlayersList;
