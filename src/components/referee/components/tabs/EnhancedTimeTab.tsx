
import PlayerTimeTracker from "../../PlayerTimeTracker";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import TimerProtectionAlert from "../TimerProtectionAlert";

interface EnhancedTimeTabProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  trackedPlayers: any[];
  selectedPlayer: string;
  selectedTimeTeam: string;
  matchTime: number;
  isTimerRunning: boolean;
  onPlayerSelect: (value: string) => void;
  onTimeTeamChange: (value: string) => void;
  onAddPlayer: (player: ComponentPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
}

const EnhancedTimeTab = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  trackedPlayers,
  selectedPlayer,
  selectedTimeTeam,
  matchTime,
  isTimerRunning,
  onPlayerSelect,
  onTimeTeamChange,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime
}: EnhancedTimeTabProps) => {
  const hasActiveTracking = trackedPlayers.some(p => p.isPlaying);

  const handleAddPlayer = () => {
    if (!selectedPlayer) return;
    
    const playersToSearch = homeTeamPlayers && awayTeamPlayers 
      ? [...homeTeamPlayers, ...awayTeamPlayers]
      : allPlayers;
    
    const player = playersToSearch.find(p => p.id.toString() === selectedPlayer);
    if (!player) return;
    
    console.log('⏱️ EnhancedTimeTab: Adding player to time tracking:', {
      player: player.name,
      team: player.team,
      role: player.position,
      source: homeTeamPlayers && awayTeamPlayers ? 'match-specific' : 'all-players'
    });
    
    onAddPlayer(player);
  };

  const playersForDropdown = homeTeamPlayers && awayTeamPlayers 
    ? [...homeTeamPlayers, ...awayTeamPlayers]
    : allPlayers;

  return (
    <div className="space-y-6">
      {/* Timer Protection Alert */}
      <TimerProtectionAlert
        isTimerRunning={isTimerRunning}
        hasActiveTracking={hasActiveTracking}
      />

      {/* Enhanced Player Time Tracker */}
      <PlayerTimeTracker
        allPlayers={playersForDropdown}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        trackedPlayers={trackedPlayers}
        selectedPlayer={selectedPlayer}
        selectedTimeTeam={selectedTimeTeam}
        onPlayerSelect={onPlayerSelect}
        onTimeTeamChange={onTimeTeamChange}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={onRemovePlayer}
        onTogglePlayerTime={onTogglePlayerTime}
        formatTime={formatTime}
        matchTime={matchTime}
        selectedFixtureData={undefined}
      />
    </div>
  );
};

export default EnhancedTimeTab;
