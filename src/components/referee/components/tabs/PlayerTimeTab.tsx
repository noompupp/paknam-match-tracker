
import { useTranslation } from "@/hooks/useTranslation";
import PlayerTimeTracker from "../../PlayerTimeTracker";

interface PlayerTimeTabProps {
  trackedPlayers: any[];
  selectedTimePlayer: string;
  setSelectedTimePlayer: (value: string) => void;
  allPlayers: any[];
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
  selectedTimeTeam: string;
  setSelectedTimeTeam: (value: string) => void;
  handleAddPlayer: (player: any) => void; // FIXED: Accept player parameter
  handleTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime: number;
  selectedFixtureData: any;
  playerHalfTimes?: Map<number, { firstHalf: number; secondHalf: number }>;
}

const PlayerTimeTab = ({
  trackedPlayers,
  selectedTimePlayer,
  setSelectedTimePlayer,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedTimeTeam,
  setSelectedTimeTeam,
  handleAddPlayer,
  handleTogglePlayerTime,
  formatTime,
  matchTime,
  selectedFixtureData,
  playerHalfTimes = new Map()
}: PlayerTimeTabProps) => {
  const { t } = useTranslation();

  // FIXED: Create wrapper function that finds the selected player and calls handleAddPlayer with it
  const handleAddPlayerWrapper = () => {
    if (!selectedTimePlayer) return;
    
    // Find the selected player from the appropriate team
    let player;
    if (selectedTimeTeam === 'home' && homeTeamPlayers) {
      player = homeTeamPlayers.find(p => p.id.toString() === selectedTimePlayer);
    } else if (selectedTimeTeam === 'away' && awayTeamPlayers) {
      player = awayTeamPlayers.find(p => p.id.toString() === selectedTimePlayer);
    }
    
    // Fallback to all players if not found
    if (!player) {
      player = allPlayers.find(p => p.id.toString() === selectedTimePlayer);
    }
    
    if (player) {
      handleAddPlayer(player);
    }
  };

  console.log('🎯 PlayerTimeTab - Props flow check with half times:', {
    trackedCount: trackedPlayers.length,
    halfTimesSize: playerHalfTimes.size,
    halfTimesReceived: !!playerHalfTimes
  });

  return (
    <div className="space-y-6">
      <PlayerTimeTracker
        trackedPlayers={trackedPlayers}
        selectedPlayer={selectedTimePlayer}
        allPlayers={allPlayers}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        selectedTimeTeam={selectedTimeTeam}
        onPlayerSelect={setSelectedTimePlayer}
        onTimeTeamChange={setSelectedTimeTeam}
        onAddPlayer={handleAddPlayerWrapper} // FIXED: Pass wrapper function
        onTogglePlayerTime={handleTogglePlayerTime}
        formatTime={formatTime}
        matchTime={matchTime}
        selectedFixtureData={selectedFixtureData}
        playerHalfTimes={playerHalfTimes}
      />
    </div>
  );
};

export default PlayerTimeTab;
