
import { useRefereeStateOrchestrator } from "./useRefereeStateOrchestrator";
import { useIntelligentSyncManager } from "./useIntelligentSyncManager";
import { useMatchDataHandlers } from "./hooks/handlers/useMatchDataHandlers";
import { useTranslation } from "@/hooks/useTranslation";

export const useRefereeToolsState = () => {
  const orchestrator = useRefereeStateOrchestrator();
  const { syncStatus, forceSync, pendingChanges } = useIntelligentSyncManager();
  const { t, language } = useTranslation();

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

  return {
    // Orchestrator state
    ...orchestrator,
    // Sync state
    syncStatus,
    forceSync,
    pendingChanges,
    // Match handlers
    handleSaveMatch,
    handleResetMatchData,
    ResetDialog,
    // Translation
    t,
    language,
  };
};
