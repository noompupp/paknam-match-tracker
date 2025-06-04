
import PlayerTimeTracker from "../../PlayerTimeTracker";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface TimeTabProps {
  allPlayers: ComponentPlayer[];
  trackedPlayers: any[];
  selectedPlayer: string;
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onAddPlayer: (player: ComponentPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
}

const TimeTab = ({
  allPlayers,
  trackedPlayers,
  selectedPlayer,
  onPlayerSelect,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime
}: TimeTabProps) => {
  return (
    <PlayerTimeTracker
      allPlayers={allPlayers}
      trackedPlayers={trackedPlayers}
      selectedPlayer={selectedPlayer}
      onPlayerSelect={onPlayerSelect}
      onAddPlayer={onAddPlayer}
      onRemovePlayer={onRemovePlayer}
      onTogglePlayerTime={onTogglePlayerTime}
      formatTime={formatTime}
      matchTime={matchTime}
    />
  );
};

export default TimeTab;
