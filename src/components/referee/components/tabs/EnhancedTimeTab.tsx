
import PlayerTimeTracker from "../../PlayerTimeTracker";
import PlayerTimeWarnings from "../PlayerTimeWarnings";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import { useTimerProtection } from "@/hooks/useTimerProtection";

interface EnhancedTimeTabProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  trackedPlayers: any[];
  selectedPlayer: string;
  matchTime: number;
  isTimerRunning: boolean;
  onPlayerSelect: (value: string) => void;
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
  matchTime,
  isTimerRunning,
  onPlayerSelect,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime
}: EnhancedTimeTabProps) => {
  const hasActiveTracking = trackedPlayers.some(p => p.isPlaying);
  
  const { isProtected } = useTimerProtection({
    isTimerRunning,
    hasActiveTracking
  });

  const handleAddPlayer = () => {
    if (!selectedPlayer) return;
    
    // Use match-specific players first, fallback to all players
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

  // Use match-specific players for the dropdown
  const playersForDropdown = homeTeamPlayers && awayTeamPlayers 
    ? [...homeTeamPlayers, ...awayTeamPlayers]
    : allPlayers;

  return (
    <div className="space-y-6">
      {/* Timer Protection Status */}
      {isProtected && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-4 w-4" />
              Timer Protection Active
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Navigation is protected while timer is running or players are being tracked
            </p>
          </CardContent>
        </Card>
      )}

      {/* Player Time Warnings */}
      <PlayerTimeWarnings
        trackedPlayers={trackedPlayers}
        allPlayers={allPlayers}
        matchTime={matchTime}
        formatTime={formatTime}
      />

      {/* Player Time Tracker */}
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
    </div>
  );
};

export default EnhancedTimeTab;
