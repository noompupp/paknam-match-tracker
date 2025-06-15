import { Card, CardContent } from "@/components/ui/card";
import TimeTrackerHeader from "./TimeTrackerHeader";
import TrackedPlayersList from "./TrackedPlayersList";
import { Users } from "lucide-react";
import InitialPlayerSelection from "./InitialPlayerSelection";
import SubstitutionFlowManager from "./SubstitutionFlowManager";

interface PlayerTimeTrackerContentProps {
  trackedPlayers: any[];
  allPlayers: any[];
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  matchTime: number;
  substitutionManager: any;
  showInitialSelection: boolean;
  setShowInitialSelection: (val: boolean) => void;
  homeTeamPlayers?: any[];
  awayTeamPlayers?: any[];
  handleStartMatch: (selectedPlayers: any[], team: 'home' | 'away') => void;
  selectedFixtureData?: any;
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
  t,
}: PlayerTimeTrackerContentProps) => (
  <Card className="card-shadow-lg">
    <TimeTrackerHeader 
      matchTime={matchTime}
      formatTime={formatTime}
    />
    
    <CardContent className="space-y-3 p-3 sm:p-6">
      {/* Tracked Players List */}
      <TrackedPlayersList
        trackedPlayers={trackedPlayers}
        allPlayers={allPlayers}
        formatTime={formatTime}
        onTogglePlayerTime={onTogglePlayerTime}
        matchTime={matchTime}
        pendingSubstitutionPlayerId={substitutionManager.pendingSubstitution?.outgoingPlayerId || null}
        substitutionManager={substitutionManager}
      />

      {!isMatchStarted && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">{t("referee.noSquadSelectedHeader")}</p>
          <p className="text-sm">{t("referee.noSquadSelectedDesc")}</p>
        </div>
      )}
    </CardContent>

    {/* Initial Player Selection Modal */}
    <InitialPlayerSelection
      isOpen={showInitialSelection}
      onClose={() => setShowInitialSelection(false)}
      homeTeamPlayers={homeTeamPlayers || []}
      awayTeamPlayers={awayTeamPlayers || []}
      onStartMatch={handleStartMatch}
      selectedFixtureData={selectedFixtureData}
    />

    {/* Dual-Behavior Substitution Flow Manager */}
    <SubstitutionFlowManager
      trackedPlayers={trackedPlayers}
      homeTeamPlayers={homeTeamPlayers}
      awayTeamPlayers={awayTeamPlayers}
      selectedFixtureData={selectedFixtureData}
      onAddPlayer={substitutionManager.handleAddPlayer}
      onSubstitutionComplete={() => {
        console.log('✅ Dual-behavior substitution completed successfully');
      }}
      substitutionManager={substitutionManager}
      onUndoSubOut={substitutionManager.handleUndoSubOut}
    />
  </Card>
);

export default PlayerTimeTrackerContent;
