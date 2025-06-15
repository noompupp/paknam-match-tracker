
import { useRefereeStateOrchestrator } from "./useRefereeStateOrchestrator";
import { useIntelligentSyncManager } from "../hooks/useIntelligentSyncManager";
import { useMatchDataHandlers } from "./handlers/useMatchDataHandlers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useRefereeToolsState = () => {
  // All-in-one state for referee tools page
  const orchestrator = useRefereeStateOrchestrator();
  const {
    syncStatus,
    forceSync,
    flushAndWait,
    clearSyncError,
    pendingChanges
  } = useIntelligentSyncManager();

  // --- Integrate new match data handlers (dialog, save, reset) ---
  const {
    handleSaveMatch,
    handleResetMatchData,
    ResetDialog,
  } = useMatchDataHandlers({
    selectedFixtureData: orchestrator.selectedFixtureData,
    homeScore: orchestrator.homeScore,
    awayScore: orchestrator.awayScore,
    goals: orchestrator.goals,
    playersForTimeTracker: orchestrator.playersForTimeTracker,
    matchTime: orchestrator.matchTime,
    setSaveAttempts: typeof orchestrator.saveAttempts === "function"
      ? orchestrator.saveAttempts
      : () => {},
    resetTimer: orchestrator.resetTimer,
    resetScore: orchestrator.resetScore,
    resetEvents: orchestrator.resetEvents,
    resetCards: orchestrator.resetCards,
    resetTracking: orchestrator.resetTracking,
    resetGoals: orchestrator.resetGoals,
    addEvent: orchestrator.addEvent,
    forceRefresh: orchestrator.forceRefresh,
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  // --- handler: Begin finish flow ---
  const handleFinishMatch = async () => {
    setFinishDialogOpen(true);
    setFinishError(null);
    clearSyncError();
  };

  // --- cancel dialog handler ---
  const handleFinishDialogCancel = () => {
    setFinishDialogOpen(false);
    setFinishError(null);
    clearSyncError();
  };

  // --- confirm dialog handler with robust sync logic ---
  const handleFinishDialogConfirm = async () => {
    setFinishLoading(true);
    setFinishError(null);
    clearSyncError();

    // STEP 1: If pending changes, flush and wait for sync
    if (pendingChanges > 0 || syncStatus.isSyncing) {
      const result = await flushAndWait(20000); // 20s timeout

      if (!result.success) {
        // Safely get the error string if present
        const errorMsg = 'error' in result && result.error
          ? result.error
          : "Unable to save match data. Please retry.";
        setFinishError(errorMsg);
        toast({
          title: "Sync Required",
          description: errorMsg,
          variant: "destructive"
        });
        setFinishLoading(false);
        return;
      }
    }

    // STEP 2: Save match meta or mark as complete
    try {
      if (typeof handleSaveMatch === "function") {
        await handleSaveMatch();
      }

      // Set fixture status to 'completed'
      if (orchestrator.selectedFixtureData?.id) {
        const { error } = await supabase
          .from("fixtures")
          .update({ status: "completed" })
          .eq("id", orchestrator.selectedFixtureData.id);

        if (error) {
          setFinishError(error.message || "Failed to mark match as completed");
          toast({
            title: "Failed to set match to completed",
            description: `Attempt to mark match as completed failed: ${error.message || "Unknown error"}`,
            variant: "destructive"
          });
          setFinishLoading(false);
          return;
        }
      }

      setFinishDialogOpen(false);
      setFinishLoading(false);

      // STEP 3: Navigate home with summary open
      navigate("/", {
        state: {
          activeTab: "results",
          openSummaryFixtureId: orchestrator.selectedFixtureData?.id
        }
      });

    } catch (e: any) {
      setFinishError(e?.message || "Unknown error");
      setFinishLoading(false);
      toast({
        title: "Error finalizing match",
        description: e?.message || "Unknown error",
        variant: "destructive"
      });
    }
  };

  // Button disabled state for Finish/Exit
  const finishDisabled = finishLoading || syncStatus.isSyncing || syncStatus.forcedSyncing || pendingChanges > 0;
  const finishSyncing = finishLoading || syncStatus.isSyncing || syncStatus.forcedSyncing;

  // All state, handlers, and UI for referee tools
  return {
    ...orchestrator,
    syncStatus,
    forceSync,
    flushAndWait,
    clearSyncError,
    pendingChanges,

    handleSaveMatch,
    handleResetMatchData,
    ResetDialog,

    finishDialogOpen,
    finishLoading,
    finishError,
    finishDisabled,
    finishSyncing,
    handleFinishMatch,
    handleFinishDialogCancel,
    handleFinishDialogConfirm,
  };
};
