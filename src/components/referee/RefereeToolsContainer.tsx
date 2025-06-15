
import { MatchSaveStatusProvider } from "./hooks/useMatchSaveStatus";
import RefereeToolsHeader from "./components/RefereeToolsHeader";
import RefereeMainContent from "./components/RefereeMainContent";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import EnhancedWorkflowModeManager from "./workflows/EnhancedWorkflowModeManager";
import { useRefereeStateOrchestrator } from "./hooks/useRefereeStateOrchestrator";
import { useState } from "react";
import { WorkflowModeConfig } from "./workflows/types";
import { useIntelligentSyncManager } from "./hooks/useIntelligentSyncManager";

// Split hook-using logic to a sub component!
const RefereeToolsContent = () => {
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowModeConfig | null>(null);

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
    handleSaveMatch,
    handleResetMatch,
    handleAssignGoal,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    toggleTimer,
    resetTimer,
    assignGoal,
    removePlayer,
    addPlayer,
    handleManualRefresh
  } = useRefereeStateOrchestrator();

  // --- NEW: Improve batch sync/atomicity/minimal REST feedback ---
  const { syncStatus, forceSync, pendingChanges } = useIntelligentSyncManager();

  const handleWorkflowConfigured = (config: any) => {
    console.log('🎯 Enhanced workflow configured in container:', config);
    const workflowModeConfig: WorkflowModeConfig = {
      mode: config.mode,
      fixtureId: config.fixtureId,
      userAssignments: config.userAssignments || [],
      allAssignments: config.allAssignments || [],
      createdAt: config.createdAt || new Date().toISOString(),
      updatedAt: config.updatedAt || new Date().toISOString()
    };
    setWorkflowConfig(workflowModeConfig);
  };

  console.log('🎮 RefereeToolsContainer: Enhanced workflow system active:', {
    selectedGoalTeam,
    selectedTimeTeam,
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    hasValidData: enhancedPlayersData.hasValidData,
    manualScore: { homeScore, awayScore },
    workflowConfigured: !!workflowConfig,
    userAssignments: workflowConfig?.userAssignments?.length || 0,
    allAssignments: workflowConfig?.allAssignments?.length || 0
  });

  if (fixturesLoading) {
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
      <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
        {/* --- New: Show loading/sync/error banner as needed --- */}
        {syncStatus.isSyncing && (
          <div className="flex items-center gap-2 py-2 px-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 mb-4">
            <span className="animate-spin mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            Saving changes to server...
          </div>
        )}
        {!!syncStatus.lastError && (
          <div className="flex items-center gap-2 py-2 px-4 bg-red-50 border border-red-200 rounded-lg text-red-800 dark:bg-red-900/10 dark:border-red-800 mb-4">
            <span className="mr-2">⚠️</span> Sync Error: {syncStatus.lastError} 
            <button className="ml-4 text-blue-700 underline" onClick={forceSync}>
               Retry Now
            </button>
          </div>
        )}
        {pendingChanges > 0 && !syncStatus.isSyncing && !syncStatus.lastError && (
          <div className="flex items-center gap-2 py-1 px-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded mb-4 text-xs">
            {pendingChanges} unsaved changes. Saving shortly...
            <button className="ml-3 underline text-blue-600" onClick={forceSync}>Sync Now</button>
          </div>
        )}

        <RefereeToolsHeader
          fixtures={fixtures || []}
          selectedFixture={selectedFixture}
          onFixtureChange={setSelectedFixture}
          enhancedPlayersData={enhancedPlayersData}
        />

        {selectedFixture && !workflowConfig && (
          <EnhancedWorkflowModeManager
            selectedFixtureData={selectedFixtureData}
            onWorkflowConfigured={handleWorkflowConfigured}
          />
        )}

        {selectedFixture && workflowConfig && (
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
            onResetMatch={handleResetMatch}
            onDataRefresh={handleManualRefresh}
            workflowConfig={workflowConfig}
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
