
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
  handleAddPlayer: () => void;
  handleTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime: number;
  selectedFixtureData: any;
  playerHalfTimes?: Map<number, { firstHalf: number; secondHalf: number }>; // FIXED: Add this prop
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
  playerHalfTimes = new Map() // FIXED: Add this prop with default
}: PlayerTimeTabProps) => {
  const { t } = useTranslation();

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
        onAddPlayer={handleAddPlayer}
        onTogglePlayerTime={handleTogglePlayerTime}
        formatTime={formatTime}
        matchTime={matchTime}
        selectedFixtureData={selectedFixtureData}
        playerHalfTimes={playerHalfTimes} // FIXED: Pass the prop
      />
    </div>
  );
};

export default PlayerTimeTab;
