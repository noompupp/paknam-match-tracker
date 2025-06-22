
// --- REFACTORED: compose behavior via focused hooks ---
import { useToast } from "@/hooks/use-toast";
import { useResetState } from "@/hooks/useResetState";
import { useMatchSaveStatus } from "../useMatchSaveStatus";
import { UseMatchDataHandlersProps } from "./types";
import { useCacheManager } from "./useCacheManager";
import { useResetConfirmationDialog } from "./useResetConfirmationDialog";
import { useMatchSaveHandler } from "./useMatchSaveHandler";
import { useMatchResetHandler } from "./useMatchResetHandler";
import React from "react";

// Main refactored hook: useMatchDataHandlers
export const useMatchDataHandlers = (props: UseMatchDataHandlersProps) => {
  const resetState = useResetState({ fixtureId: props.selectedFixtureData?.id });
  const cacheManager = useCacheManager();
  const { ResetDialog, showResetDialog } = useResetConfirmationDialog();
  const { setPhase, reset: resetSaveStatus } = useMatchSaveStatus();

  // Compose save handler with everything it needs
  const { handleSaveMatch } = useMatchSaveHandler({
    ...props,
    resetState,
    cacheManager
  });

  // Compose reset handler, provide the dialog and all relevant props
  const { handleResetMatchData } = useMatchResetHandler({
    ...props,
    resetState,
    cacheManager,
    showResetDialog,
    resetSaveStatus,
    forceRefresh: props.forceRefresh
  });

  // Provide a no-op duplicate cleanup handler for now
  const handleCleanupDuplicates = async () => {
    // Could house logic to remove duplicate events, etc.
    const { toast } = useToast();
    toast({
      title: "🧹 Not implemented",
      description: "Cleanup duplicates handler not implemented in refactor.",
    });
  };

  // Expose the dialog, save/reset handlers, and resetState for coordination
  return {
    handleSaveMatch,
    handleResetMatchData,
    handleCleanupDuplicates,
    resetState,
    ResetDialog // Render this in your UI at root level
  };
};
