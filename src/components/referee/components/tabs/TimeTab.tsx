
import PlayerTimeTracker from "../../PlayerTimeTracker";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface TimeTabProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
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
  homeTeamPlayers,
  awayTeamPlayers,
  trackedPlayers,
  selectedPlayer,
  onPlayerSelect,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime
}: TimeTabProps) => {
  const handleAddPlayer = () => {
    if (!selectedPlayer) return;
    
    // Use match-specific players first, fallback to all players
    const playersToSearch = homeTeamPlayers && awayTeamPlayers 
      ? [...homeTeamPlayers, ...awayTeamPlayers]
      : allPlayers;
    
    const player = playersToSearch.find(p => p.id.toString() === selectedPlayer);
    if (!player) return;
    
    console.log('⏱️ TimeTab: Adding player to time tracking:', {
      player: player.name,
      team: player.team,
      source: homeTeamPlayers && awayTeamPlayers ? 'match-specific' : 'all-players'
    });
    
    onAddPlayer(player);
  };

  // Use match-specific players for the dropdown
  const playersForDropdown = homeTeamPlayers && awayTeamPlayers 
    ? [...homeTeamPlayers, ...awayTeamPlayers]
    : allPlayers;

  return (
    <PlayerTimeTracker
      allPlayers={playersForDropdown}
      trackedPlayers={trackedPlayers}
      selectedPlayer={selectedPlayer}
      onPlayerSelect={onPlayerSelect}
      onAddPlayer={handleAddPlayer}
      onRemovePlayer={onRemovePlayer}
      onTogglePlayerTime={onTogglePlayerTime}
      formatTime={formatTime}
      matchTime={matchTime}
    />
  );
};

export default TimeTab;
