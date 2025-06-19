
import RefereeToolsHeader from "./RefereeToolsHeader";
import RefereeMainContent from "./RefereeMainContent";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import RefereeToolsSyncStatus from "./RefereeToolsSyncStatus";
import { useRefereeToolsState } from "../hooks/useRefereeToolsState";

const RefereeToolsContent = () => {
  const state = useRefereeToolsState();

  if (state.fixturesLoading) {
    return (
      <>
        <UnifiedPageHeader 
          title={state.t("referee.title")}
          showLanguageToggle={true}
        />
        <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
          <div className="flex items-center justify-center h-32">
            <p>{state.t("referee.loadingFixtures", "Loading fixtures...")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <UnifiedPageHeader 
        title={state.t("referee.title")}
        showLanguageToggle={true}
      />
      {state.ResetDialog}
      <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
        <RefereeToolsSyncStatus
          syncStatus={state.syncStatus}
          pendingChanges={state.pendingChanges}
          forceSync={state.forceSync}
        />

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
            onDataRefresh={state.handleManualRefresh}
          />
        )}
      </main>
    </>
  );
};

export default RefereeToolsContent;
