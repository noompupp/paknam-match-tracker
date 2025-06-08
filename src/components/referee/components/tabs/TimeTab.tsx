
import { ComponentPlayer } from "../../hooks/useRefereeState";
import EnhancedPlayerTimeTracker from "../playerTimeTracker/EnhancedPlayerTimeTracker";
import RoleBasedTimerNotifications from "../RoleBasedTimerNotifications";

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
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime,
  selectedFixtureData,
  getRoleBasedNotifications
}: TimeTabProps) => {
  // Get role-based notifications using role field
  const roleNotifications = getRoleBasedNotifications 
    ? getRoleBasedNotifications(allPlayers, matchTime)
    : [];

  console.log('📋 TimeTab: Enhanced timer with new workflows:', {
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    trackedPlayersCount: trackedPlayers.length,
    roleNotificationsCount: roleNotifications.length
  });

  return (
    <div className="space-y-6">
      {/* Role-Based Timer Notifications */}
      <RoleBasedTimerNotifications
        notifications={roleNotifications}
        formatTime={formatTime}
      />

      {/* Enhanced Player Time Tracker with new workflows */}
      <EnhancedPlayerTimeTracker
        allPlayers={allPlayers}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        trackedPlayers={trackedPlayers}
        onAddPlayer={onAddPlayer}
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
