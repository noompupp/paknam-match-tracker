import RefereeToolsHeader from "./components/RefereeToolsHeader";
import RefereeMainContent from "./components/RefereeMainContent";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useRefereeStateOrchestrator } from "./hooks/useRefereeStateOrchestrator";
import { useIntelligentSyncManager } from "./hooks/useIntelligentSyncManager";
import { MatchSaveStatusProvider } from "./hooks/useMatchSaveStatus";
import { useState } from "react";
import FinishMatchConfirmationDialog from "./components/FinishMatchConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
// Import useMatchDataHandlers
import { useMatchDataHandlers } from "./hooks/handlers/useMatchDataHandlers";
// Import Supabase
import { supabase } from "@/integrations/supabase/client";

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
    resetScore,
    resetEvents,
    resetCards,
    resetTracking,
    resetGoals,
    addEvent,
    // --- THE FOLLOWING REFS ARE NOT NEEDED AS WE USE DATA HANDLERS ---
    // handleSaveMatch,
    // handleResetMatch,
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
    playersForTimeTracker,
    forceRefresh,
  } = useRefereeStateOrchestrator();

  // Batch sync/atomicity/minimal REST feedback
  const { syncStatus, forceSync, pendingChanges } = useIntelligentSyncManager();

  // --- Integrate new match data handlers (dialog, save, reset) ---
  // Supplying all required arguments from orchestrator
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
      : () => {}, // fallback no-op if not available
    resetTimer,
    resetScore,
    resetEvents,
    resetCards,
    resetTracking,
    resetGoals,
    addEvent,
    forceRefresh,
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);

  // --- handler: Begin finish flow ---
  const handleFinishMatch = async () => {
    console.log("🔵 handleFinishMatch called");
    setFinishDialogOpen(true);
  };

  // --- cancel dialog handler ---
  const handleFinishDialogCancel = () => {
    console.log("🟡 handleFinishDialogCancel called");
    setFinishDialogOpen(false);
  };

  // --- confirm dialog handler ---
  const handleFinishDialogConfirm = async () => {
    setFinishLoading(true);
    console.log("🔴 handleFinishDialogConfirm called");
    try {
      if (typeof handleSaveMatch === "function") {
        console.log("⬛ Calling handleSaveMatch...");
        await handleSaveMatch();
        console.log("🟩 handleSaveMatch complete");
      }

      // 2. Set fixture status to 'completed'
      if (selectedFixtureData?.id) {
        console.log("⬛ Updating fixture status to 'completed' for id", selectedFixtureData.id);
        const { error } = await supabase
          .from("fixtures")
          .update({ status: "completed" })
          .eq("id", selectedFixtureData.id);

        if (error) {
          console.error("❌ Failed to update fixture status:", error.message || error);
          toast({
            title: "Failed to set match to completed",
            description: `Attempt to mark match as completed failed: ${error.message || "Unknown error"}`,
            variant: "destructive"
          });
        } else {
          console.log("🟩 Fixture status update succeeded");
        }
      } else {
        console.warn("⚠️ selectedFixtureData?.id unavailable, could not update fixture status.");
      }
      setFinishDialogOpen(false);
      setFinishLoading(false);

      // 3. Navigate to results & open summary for this fixture
      navigate("/", {
        state: {
          activeTab: "results",
          openSummaryFixtureId: selectedFixtureData?.id
        }
      });
      console.log("🟩 Navigated to results with openSummaryFixtureId", selectedFixtureData?.id);

    } catch (e) {
      setFinishLoading(false);
      console.error("❌ Error in handleFinishDialogConfirm:", e);
      toast({
        title: "Error finalizing match",
        description: e?.message || "Unknown error",
        variant: "destructive"
      });
    }
  };

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
      {/* --- Ensure dialog components are rendered at root --- */}
      {ResetDialog}
      <FinishMatchConfirmationDialog
        open={finishDialogOpen}
        onCancel={handleFinishDialogCancel}
        onConfirm={handleFinishDialogConfirm}
        loading={finishLoading}
      />
      <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
        {/* Sync banners */}
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
            onFinishMatch={handleFinishMatch}
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
