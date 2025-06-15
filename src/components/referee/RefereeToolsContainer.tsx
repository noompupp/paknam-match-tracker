import RefereeToolsHeader from "./components/RefereeToolsHeader";
import RefereeMainContent from "./components/RefereeMainContent";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useRefereeStateOrchestrator } from "./hooks/useRefereeStateOrchestrator";
import { useIntelligentSyncManager } from "./hooks/useIntelligentSyncManager";
import { MatchSaveStatusProvider } from "./hooks/useMatchSaveStatus";
import { useState } from "react";

// Import useMatchDataHandlers (for reset/save/dialog logic)
import { useMatchDataHandlers } from "./hooks/handlers/useMatchDataHandlers";

// Import translation
import { useTranslation } from "@/hooks/useTranslation";

const RefereeToolsContent = () => {
  const {
    fixtures,
    fixturesLoading,
    selectedFixture,
    setSelectedFixture,
    selectedFixtureData,
    enhancedPlayersData,
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    selectedGoalTeam,
    setSelectedGoalTeam,
    selectedTimeTeam,
    setSelectedTimeTeam,
    matchTime,
    isRunning,
    formatTime,
    homeScore,
    awayScore,
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    trackedPlayers,
    selectedTimePlayer,
    setSelectedTimePlayer,
    events,
    saveAttempts,
    handleAssignGoal,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    toggleTimer,
    resetTimer,
    assignGoal,
    removePlayer,
    addPlayer,
    handleManualRefresh,
    resetScore,
    resetEvents,
    resetCards,
    resetTracking,
    resetGoals,
    addEvent,
    playersForTimeTracker,
    forceRefresh,
  } = useRefereeStateOrchestrator();

  const { syncStatus, forceSync, pendingChanges } = useIntelligentSyncManager();

  const {
    handleSaveMatch,
    handleResetMatchData,
    ResetDialog,
  } = useMatchDataHandlers({
    selectedFixtureData,
    homeScore,
    awayScore,
    goals,
    playersForTimeTracker,
    matchTime,
    setSaveAttempts: typeof saveAttempts === "function"
      ? saveAttempts
      : () => {},
    resetTimer,
    resetScore,
    resetEvents,
    resetCards,
    resetTracking,
    resetGoals,
    addEvent,
    forceRefresh,
  });

  const { t, language } = useTranslation();

  if (fixturesLoading) {
    return (
      <>
        <UnifiedPageHeader 
          title={t("referee.title")}
          showLanguageToggle={true}
        />
        <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
          <div className="flex items-center justify-center h-32">
            <p>{t("referee.loadingFixtures", "Loading fixtures...")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <UnifiedPageHeader 
        title={t("referee.title")}
        showLanguageToggle={true}
      />
      {ResetDialog}
      <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
        {syncStatus.isSyncing && (
          <div className="flex items-center gap-2 py-2 px-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 mb-4">
            <span className="animate-spin mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            {t("referee.sync.saving")}
          </div>
        )}
        {!!syncStatus.lastError && (
          <div className="flex items-center gap-2 py-2 px-4 bg-red-50 border border-red-200 rounded-lg text-red-800 dark:bg-red-900/10 dark:border-red-800 mb-4">
            <span className="mr-2">⚠️</span> {t("referee.sync.error")}: {syncStatus.lastError} 
            <button className="ml-4 text-blue-700 underline" onClick={forceSync}>
              {t("referee.sync.retry")}
            </button>
          </div>
        )}
        {pendingChanges > 0 && !syncStatus.isSyncing && !syncStatus.lastError && (
          <div className="flex items-center gap-2 py-1 px-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded mb-4 text-xs">
            {t("referee.sync.pending").replace("{count}", pendingChanges.toString())}
            <button className="ml-3 underline text-blue-600" onClick={forceSync}>
              {t("referee.sync.syncNow")}
            </button>
          </div>
        )}

        <RefereeToolsHeader
          fixtures={fixtures || []}
          selectedFixture={selectedFixture}
          onFixtureChange={setSelectedFixture}
          enhancedPlayersData={enhancedPlayersData}
        />

        {/* 🔓 UnifiedMatchTimer and all score/timer functionality should NEVER be blocked by permissions */}
        {selectedFixture && (
          <RefereeMainContent
            selectedFixtureData={selectedFixtureData}
            homeScore={homeScore}
            awayScore={awayScore}
            matchTime={matchTime}
            isRunning={isRunning}
            formatTime={formatTime}
            allPlayers={allPlayers}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
            goals={goals}
            selectedGoalPlayer={selectedGoalPlayer}
            selectedGoalType={selectedGoalType}
            selectedGoalTeam={selectedGoalTeam}
            setSelectedGoalPlayer={setSelectedGoalPlayer}
            setSelectedGoalType={setSelectedGoalType}
            setSelectedGoalTeam={setSelectedGoalTeam}
            cards={cards}
            selectedPlayer={selectedPlayer}
            selectedTeam={selectedTeam}
            selectedCardType={selectedCardType}
            setSelectedPlayer={setSelectedPlayer}
            setSelectedTeam={setSelectedTeam}
            setSelectedCardType={setSelectedCardType}
            trackedPlayers={trackedPlayers}
            selectedTimePlayer={selectedTimePlayer}
            selectedTimeTeam={selectedTimeTeam}
            setSelectedTimePlayer={setSelectedTimePlayer}
            setSelectedTimeTeam={setSelectedTimeTeam}
            events={events}
            saveAttempts={Array.isArray(saveAttempts) ? saveAttempts : []}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            assignGoal={handleAssignGoal}
            addPlayer={handleAddPlayer}
            removePlayer={handleRemovePlayer}
            togglePlayerTime={handleTogglePlayerTime}
            onSaveMatch={handleSaveMatch}
            onResetMatch={handleResetMatchData}
            onDataRefresh={handleManualRefresh}
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
