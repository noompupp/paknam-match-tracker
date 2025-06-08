
import PlayerTimeTracker from "../../PlayerTimeTracker";
import RoleBasedTimerNotifications from "../RoleBasedTimerNotifications";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface TimeTabProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  trackedPlayers: any[];
  selectedPlayer: string;
  selectedTimeTeam: string;
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onTimeTeamChange: (value: string) => void;
  onAddPlayer: (player: ComponentPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  selectedFixtureData: any;
  getRoleBasedNotifications?: (allPlayers: ComponentPlayer[], matchTime: number) => Array<{
    playerId: number;
    playerName: string;
    role: string;
    type: 'warning' | 'limit_reached' | 'auto_stopped' | 'minimum_needed';
    message: string;
  }>;
}

const TimeTab = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  trackedPlayers,
  selectedPlayer,
  selectedTimeTeam,
  onPlayerSelect,
  onTimeTeamChange,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime,
  selectedFixtureData,
  getRoleBasedNotifications
}: TimeTabProps) => {
  const handleAddPlayer = () => {
    if (!selectedPlayer || !selectedTimeTeam) return;
    
    // Get filtered players based on selected team
    const getFilteredPlayers = () => {
      if (selectedTimeTeam === 'home' && homeTeamPlayers) {
        return homeTeamPlayers;
      } else if (selectedTimeTeam === 'away' && awayTeamPlayers) {
        return awayTeamPlayers;
      }
      return [];
    };
    
    const filteredPlayers = getFilteredPlayers();
    const player = filteredPlayers.find(p => p.id.toString() === selectedPlayer);
    
    if (!player) {
      console.warn('Player not found in filtered list:', selectedPlayer);
      return;
    }
    
    console.log('⏱️ TimeTab: Adding player to time tracking:', {
      player: player.name,
      team: player.team,
      selectedTeam: selectedTimeTeam,
      role: player.position,
      source: 'team-filtered'
    });
    
    onAddPlayer(player);
  };

  // Get role-based notifications
  const roleNotifications = getRoleBasedNotifications 
    ? getRoleBasedNotifications(allPlayers, matchTime)
    : [];

  return (
    <div className="space-y-6">
      {/* Role-Based Timer Notifications */}
      <RoleBasedTimerNotifications
        notifications={roleNotifications}
        formatTime={formatTime}
      />

      {/* Player Time Tracker */}
      <PlayerTimeTracker
        allPlayers={allPlayers}
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
        selectedFixtureData={selectedFixtureData}
      />
    </div>
  );
};

export default TimeTab;
