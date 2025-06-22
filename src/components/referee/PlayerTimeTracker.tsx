
import { Card, CardContent } from "@/components/ui/card";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import SevenASideValidationPanel from "./components/SevenASideValidationPanel";
import PlayerSelectionSection from "./components/playerTimeTracker/PlayerSelectionSection";
import TrackedPlayersList from "./components/playerTimeTracker/TrackedPlayersList";
import TimeTrackerHeader from "./components/playerTimeTracker/TimeTrackerHeader";

interface PlayerTimeTrackerProps {
  trackedPlayers: PlayerTime[];
  selectedPlayer: string;
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  selectedTimeTeam: string;
  onPlayerSelect: (value: string) => void;
  onTimeTeamChange: (value: string) => void;
  onAddPlayer: () => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime?: number;
  selectedFixtureData?: any;
  playerHalfTimes?: Map<number, { firstHalf: number; secondHalf: number }>; // FIXED: Already has this prop
}

const PlayerTimeTracker = ({
  trackedPlayers,
  selectedPlayer,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedTimeTeam,
  onPlayerSelect,
  onTimeTeamChange,
  onAddPlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime = 0,
  selectedFixtureData,
  playerHalfTimes = new Map() // FIXED: Already has default value
}: PlayerTimeTrackerProps) => {
  
  console.log('⏱️ PlayerTimeTracker Debug - FIXED with Half Times Props Flow:', {
    selectedTeam: selectedTimeTeam,
    homeTeamPlayers: homeTeamPlayers?.length || 0,
    awayTeamPlayers: awayTeamPlayers?.length || 0,
    trackedPlayers: trackedPlayers.length,
    matchTime: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`,
    halfTimesMapSize: playerHalfTimes.size,
    halfTimesReceived: !!playerHalfTimes,
    halfTimesEntries: Array.from(playerHalfTimes.entries()).slice(0, 3).map(([id, times]) => ({
      playerId: id,
      firstHalf: `${Math.floor(times.firstHalf / 60)}:${String(times.firstHalf % 60).padStart(2, '0')}`,
      secondHalf: `${Math.floor(times.secondHalf / 60)}:${String(times.secondHalf % 60).padStart(2, '0')}`
    }))
  });

  return (
    <div className="space-y-4">
      {/* Enhanced 7-a-Side Validation Panel - FIXED: Pass playerHalfTimes */}
      <SevenASideValidationPanel
        trackedPlayers={trackedPlayers}
        allPlayers={allPlayers}
        matchTime={matchTime}
        formatTime={formatTime}
        playerHalfTimes={playerHalfTimes}
      />

      <Card className="card-shadow-lg">
        <TimeTrackerHeader 
          matchTime={matchTime}
          formatTime={formatTime}
        />
        
        <CardContent className="space-y-3 p-3 sm:p-6">
          {/* Player Selection Section */}
          <PlayerSelectionSection
            selectedPlayer={selectedPlayer}
            selectedTimeTeam={selectedTimeTeam}
            selectedFixtureData={selectedFixtureData}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
            onPlayerSelect={onPlayerSelect}
            onTimeTeamChange={onTimeTeamChange}
            onAddPlayer={onAddPlayer}
          />

          {/* Tracked Players List - FIXED: Pass playerHalfTimes */}
          <TrackedPlayersList
            trackedPlayers={trackedPlayers}
            allPlayers={allPlayers}
            formatTime={formatTime}
            onTogglePlayerTime={onTogglePlayerTime}
            playerHalfTimes={playerHalfTimes}
            matchTime={matchTime}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTimeTracker;
