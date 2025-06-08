
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
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime?: number;
  selectedFixtureData?: any;
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
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime = 0,
  selectedFixtureData
}: PlayerTimeTrackerProps) => {
  
  console.log('⏱️ PlayerTimeTracker Debug (Role-Based):');
  console.log('  - Selected team:', selectedTimeTeam);
  console.log('  - Home team players:', homeTeamPlayers?.length || 0);
  console.log('  - Away team players:', awayTeamPlayers?.length || 0);
  console.log('  - Tracked players:', trackedPlayers.length);

  return (
    <div className="space-y-4">
      {/* Enhanced 7-a-Side Validation Panel */}
      <SevenASideValidationPanel
        trackedPlayers={trackedPlayers}
        allPlayers={allPlayers}
        matchTime={matchTime}
        formatTime={formatTime}
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

          {/* Tracked Players List */}
          <TrackedPlayersList
            trackedPlayers={trackedPlayers}
            allPlayers={allPlayers}
            formatTime={formatTime}
            onTogglePlayerTime={onTogglePlayerTime}
            onRemovePlayer={onRemovePlayer}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTimeTracker;
