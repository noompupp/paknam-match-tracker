
import { Card, CardContent } from "@/components/ui/card";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import InitialPlayerSelection from "./InitialPlayerSelection";
import TimeTrackerHeader from "./TimeTrackerHeader";
import PlayerSelectionSection from "./PlayerSelectionSection";
import TrackedPlayersList from "./TrackedPlayersList";

interface PlayerTimeTrackerContentProps {
  trackedPlayers: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  matchTime: number;
  substitutionManager: any;
  showInitialSelection: boolean;
  setShowInitialSelection: (show: boolean) => void;
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  handleStartMatch: (selectedPlayers: ProcessedPlayer[], team: 'home' | 'away') => void;
  selectedFixtureData: any;
  isMatchStarted: boolean;
  t: any;
}

const PlayerTimeTrackerContent = ({
  trackedPlayers,
  allPlayers,
  formatTime,
  onTogglePlayerTime,
  matchTime,
  substitutionManager,
  showInitialSelection,
  setShowInitialSelection,
  homeTeamPlayers,
  awayTeamPlayers,
  handleStartMatch,
  selectedFixtureData,
  isMatchStarted,
  t
}: PlayerTimeTrackerContentProps) => {
  
  console.log('🎯 PlayerTimeTrackerContent Debug:', {
    trackedPlayersCount: trackedPlayers.length,
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    showInitialSelection,
    isMatchStarted
  });

  return (
    <>
      {/* Initial Player Selection Modal */}
      <InitialPlayerSelection
        isOpen={showInitialSelection}
        onClose={() => setShowInitialSelection(false)}
        homeTeamPlayers={homeTeamPlayers || []}
        awayTeamPlayers={awayTeamPlayers || []}
        onStartMatch={handleStartMatch}
        selectedFixtureData={selectedFixtureData}
      />

      {/* Main Player Time Tracker Card */}
      <Card className="card-shadow-lg">
        <TimeTrackerHeader 
          matchTime={matchTime}
          formatTime={formatTime}
        />
        
        <CardContent className="space-y-3 p-3 sm:p-6">
          {/* Player Selection Section - Only show if match not started */}
          {!isMatchStarted && (
            <PlayerSelectionSection
              selectedPlayer=""
              selectedTimeTeam=""
              selectedFixtureData={selectedFixtureData}
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              onPlayerSelect={() => {}}
              onTimeTeamChange={() => {}}
              onAddPlayer={substitutionManager.handleAddPlayer}
            />
          )}

          {/* Tracked Players List */}
          <TrackedPlayersList
            trackedPlayers={trackedPlayers}
            allPlayers={allPlayers}
            formatTime={formatTime}
            onTogglePlayerTime={onTogglePlayerTime}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default PlayerTimeTrackerContent;
