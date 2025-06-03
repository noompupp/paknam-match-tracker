
import MatchSelection from "./MatchSelection";
import RefereeHeader from "./components/RefereeHeader";
import RefereeMatchControls from "./components/RefereeMatchControls";
import { useRefereeState } from "./hooks/useRefereeState";
import { useRefereeHandlers } from "./hooks/useRefereeHandlers";

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
            onRemoveGoal={state.removeGoal}
            onToggleTimer={handlers.handleToggleTimer}
            onResetMatch={handlers.handleResetMatch}
            onSaveMatch={handlers.handleSaveMatch}
            onAssignGoal={handlers.handleAssignGoal}
            onAddCard={handlers.handleAddCard}
            onAddPlayer={handlers.handleAddPlayer}
            onRemovePlayer={handlers.handleRemovePlayer}
            onTogglePlayerTime={handlers.handleTogglePlayerTime}
            onExportSummary={handlers.handleExportSummary}
          />
        )}
      </div>
    </div>
  );
};

export default RefereeToolsContainer;
