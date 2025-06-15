
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
  const { syncStatus, forceSync, pendingChanges } = useIntelligentSyncManager();

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

  // --- handler: Begin finish flow ---
  const handleFinishMatch = async () => {
    setFinishDialogOpen(true);
  };

  // --- cancel dialog handler ---
  const handleFinishDialogCancel = () => {
    setFinishDialogOpen(false);
  };

  // --- confirm dialog handler ---
  const handleFinishDialogConfirm = async () => {
    setFinishLoading(true);
    try {
      if (typeof handleSaveMatch === "function") {
        await handleSaveMatch();
      }

      // 2. Set fixture status to 'completed'
      if (orchestrator.selectedFixtureData?.id) {
        const { error } = await supabase
          .from("fixtures")
          .update({ status: "completed" })
          .eq("id", orchestrator.selectedFixtureData.id);

        if (error) {
          toast({
            title: "Failed to set match to completed",
            description: `Attempt to mark match as completed failed: ${error.message || "Unknown error"}`,
            variant: "destructive"
          });
        }
      }
      setFinishDialogOpen(false);
      setFinishLoading(false);

      // 3. Navigate to results & open summary for this fixture
      navigate("/", {
        state: {
          activeTab: "results",
          openSummaryFixtureId: orchestrator.selectedFixtureData?.id
        }
      });

    } catch (e) {
      setFinishLoading(false);
      toast({
        title: "Error finalizing match",
        description: e?.message || "Unknown error",
        variant: "destructive"
      });
    }
  };

  // All state, handlers, and UI for referee tools
  return {
    ...orchestrator,
    syncStatus,
    forceSync,
    pendingChanges,

    handleSaveMatch,
    handleResetMatchData,
    ResetDialog,

    finishDialogOpen,
    finishLoading,
    handleFinishMatch,
    handleFinishDialogCancel,
    handleFinishDialogConfirm,
  };
};

