
import MatchSelection from "./MatchSelection";
import RefereeHeader from "./components/RefereeHeader";
import RefereeMatchControls from "./components/RefereeMatchControls";
import { useRefereeState } from "./hooks/useRefereeState";
import { useRefereeHandlers } from "./hooks/useRefereeHandlers";
import { Button } from "@/components/ui/button";
import { Save, Database, RotateCcw, Trash2 } from "lucide-react";

const RefereeToolsContainer = () => {
  const state = useRefereeState();
  const handlers = useRefereeHandlers(state);

  if (state.fixturesLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center pb-20">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <RefereeHeader
          saveAttempts={state.saveAttempts}
          playersNeedingAttention={state.playersNeedingAttention}
        />

        <MatchSelection
          fixtures={state.fixtures || []}
          selectedFixture={state.selectedFixture}
          onFixtureChange={state.setSelectedFixture}
        />

        {state.selectedFixtureData && (
          <>
            <RefereeMatchControls
              selectedFixtureData={state.selectedFixtureData}
              homeScore={state.homeScore}
              awayScore={state.awayScore}
              matchTime={state.matchTime}
              isRunning={state.isRunning}
              formatTime={state.formatTime}
              allPlayers={state.allPlayers}
              playersForTimeTracker={state.playersForTimeTracker}
              goals={state.goals}
              selectedGoalPlayer={state.selectedGoalPlayer}
              selectedGoalType={state.selectedGoalType}
              setSelectedGoalPlayer={state.setSelectedGoalPlayer}
              setSelectedGoalType={state.setSelectedGoalType}
              selectedPlayer={state.selectedPlayer}
              selectedTeam={state.selectedTeam}
              selectedCardType={state.selectedCardType}
              setSelectedPlayer={state.setSelectedPlayer}
              setSelectedTeam={state.setSelectedTeam}
              setSelectedCardType={state.setSelectedCardType}
              cards={state.cards}
              trackedPlayers={state.trackedPlayers}
              selectedTimePlayer={state.selectedTimePlayer}
              setSelectedTimePlayer={state.setSelectedTimePlayer}
              events={state.events}
              updateFixtureScore={state.updateFixtureScore}
              onAddGoal={handlers.handleAddGoal}
              onRemoveGoal={handlers.handleRemoveGoal}
              onToggleTimer={handlers.handleToggleTimer}
              onResetMatch={handlers.handleResetMatch}
              onSaveMatch={handlers.handleSaveMatch}
              onAssignGoal={(player) => handlers.handleAssignGoal(player)}
              onAddCard={(playerName: string, team: string, cardType: 'yellow' | 'red', time: number) => 
                handlers.handleAddCard(playerName, team, cardType, time)
              }
              onAddPlayer={(player) => handlers.handleAddPlayer(player)}
              onRemovePlayer={(playerId: number) => handlers.handleRemovePlayer(playerId)}
              onTogglePlayerTime={(playerId: number) => handlers.handleTogglePlayerTime(playerId)}
              onExportSummary={handlers.handleExportSummary}
            />

            {/* Enhanced Controls for Database Integration */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={handlers.handleSaveAllPlayerTimes}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Save Player Times
              </Button>
              <Button 
                onClick={handlers.handleSaveMatch}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Match
              </Button>
              <Button 
                onClick={handlers.handleCleanupDuplicates}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Cleanup Duplicates
              </Button>
              <Button 
                onClick={handlers.handleResetMatchData}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Reset Match Data
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RefereeToolsContainer;
