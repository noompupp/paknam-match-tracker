
import { Card, CardContent } from "@/components/ui/card";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import SevenASideValidationPanel from "../SevenASideValidationPanel";
import TimeTrackerHeader from "./TimeTrackerHeader";
import PlayerSelectionSection from "./PlayerSelectionSection";
import TrackedPlayersList from "./TrackedPlayersList";

interface SimplePlayerTimeTrackerProps {
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
}

const SimplePlayerTimeTracker = ({
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
  selectedFixtureData
}: SimplePlayerTimeTrackerProps) => {
  
  console.log('⏱️ SimplePlayerTimeTracker Debug:', {
    trackedCount: trackedPlayers.length,
    selectedPlayer,
    selectedTimeTeam,
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    allPlayersCount: allPlayers.length
  });

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
            matchTime={matchTime}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplePlayerTimeTracker;
