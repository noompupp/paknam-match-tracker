
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import RefereeToolsHeader from "./components/RefereeToolsHeader";
import RefereeMainContent from "./components/RefereeMainContent";
import { MatchSaveStatusProvider } from "./hooks/useMatchSaveStatus";
import FinishMatchConfirmationDialog from "./components/FinishMatchConfirmationDialog";
// Use new consolidated hook
import { useRefereeToolsState } from "./hooks/useRefereeToolsState";

const RefereeToolsContent = () => {
  const state = useRefereeToolsState();

  if (state.fixturesLoading) {
    return (
      <>
        <UnifiedPageHeader 
          title="Referee Tools"
          showLanguageToggle={true}
        />
        <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
          <div className="flex items-center justify-center h-32">
            <p>Loading fixtures...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <UnifiedPageHeader 
        title="Referee Tools"
        showLanguageToggle={true}
      />
      {/* Dialog components */}
      {state.ResetDialog}
      <FinishMatchConfirmationDialog
        open={state.finishDialogOpen}
        onCancel={state.handleFinishDialogCancel}
        onConfirm={state.handleFinishDialogConfirm}
        loading={state.finishLoading}
      />
      <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
        {/* Sync banners */}
        {state.syncStatus.isSyncing && (
          <div className="flex items-center gap-2 py-2 px-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 mb-4">
            <span className="animate-spin mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            Saving changes to server...
          </div>
        )}
        {!!state.syncStatus.lastError && (
          <div className="flex items-center gap-2 py-2 px-4 bg-red-50 border border-red-200 rounded-lg text-red-800 dark:bg-red-900/10 dark:border-red-800 mb-4">
            <span className="mr-2">⚠️</span> Sync Error: {state.syncStatus.lastError} 
            <button className="ml-4 text-blue-700 underline" onClick={state.forceSync}>
               Retry Now
            </button>
          </div>
        )}
        {state.pendingChanges > 0 && !state.syncStatus.isSyncing && !state.syncStatus.lastError && (
          <div className="flex items-center gap-2 py-1 px-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded mb-4 text-xs">
            {state.pendingChanges} unsaved changes. Saving shortly...
            <button className="ml-3 underline text-blue-600" onClick={state.forceSync}>Sync Now</button>
          </div>
        )}

        <RefereeToolsHeader
          fixtures={state.fixtures || []}
          selectedFixture={state.selectedFixture}
          onFixtureChange={state.setSelectedFixture}
          enhancedPlayersData={state.enhancedPlayersData}
        />

        {state.selectedFixture && (
          <RefereeMainContent
            selectedFixtureData={state.selectedFixtureData}
            homeScore={state.homeScore}
            awayScore={state.awayScore}
            matchTime={state.matchTime}
            isRunning={state.isRunning}
            formatTime={state.formatTime}
            allPlayers={state.allPlayers}
            homeTeamPlayers={state.homeTeamPlayers}
            awayTeamPlayers={state.awayTeamPlayers}
            goals={state.goals}
            selectedGoalPlayer={state.selectedGoalPlayer}
            selectedGoalType={state.selectedGoalType}
            selectedGoalTeam={state.selectedGoalTeam}
            setSelectedGoalPlayer={state.setSelectedGoalPlayer}
            setSelectedGoalType={state.setSelectedGoalType}
            setSelectedGoalTeam={state.setSelectedGoalTeam}
            cards={state.cards}
            selectedPlayer={state.selectedPlayer}
            selectedTeam={state.selectedTeam}
            selectedCardType={state.selectedCardType}
            setSelectedPlayer={state.setSelectedPlayer}
            setSelectedTeam={state.setSelectedTeam}
            setSelectedCardType={state.setSelectedCardType}
            trackedPlayers={state.trackedPlayers}
            selectedTimePlayer={state.selectedTimePlayer}
            selectedTimeTeam={state.selectedTimeTeam}
            setSelectedTimePlayer={state.setSelectedTimePlayer}
            setSelectedTimeTeam={state.setSelectedTimeTeam}
            events={state.events}
            saveAttempts={Array.isArray(state.saveAttempts) ? state.saveAttempts : []}
            toggleTimer={state.toggleTimer}
            resetTimer={state.resetTimer}
            assignGoal={state.handleAssignGoal}
            addPlayer={state.handleAddPlayer}
            removePlayer={state.handleRemovePlayer}
            togglePlayerTime={state.handleTogglePlayerTime}
            onSaveMatch={state.handleSaveMatch}
            onResetMatch={state.handleResetMatchData}
            onFinishMatch={state.handleFinishMatch}
            onDataRefresh={state.handleManualRefresh}
          />
        )}
      </main>
    </>
  );
};

const RefereeToolsContainer = () => {
  return (
    <MatchSaveStatusProvider>
      <RefereeToolsContent />
    </MatchSaveStatusProvider>
  );
};

export default RefereeToolsContainer;
