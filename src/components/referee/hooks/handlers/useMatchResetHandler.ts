
import { useToast } from "@/hooks/use-toast";
import { useMatchSaveStatus } from "../useMatchSaveStatus";
import { matchResetService } from "@/services/fixtures";
import { UseMatchDataHandlersProps } from "./types";

export const useMatchResetHandler = (
  props: UseMatchDataHandlersProps & {
    resetState: any;
    cacheManager: any;
    showResetDialog: (warnings?: string[]) => Promise<boolean>;
    resetSaveStatus: () => void;
    forceRefresh?: () => Promise<void>;
  }
) => {
  const { toast } = useToast();
  const { setPhase } = useMatchSaveStatus();

  const handleResetMatchData = async () => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected for reset",
        variant: "destructive"
      });
      return;
    }

    try {
      setPhase("validating", { statusMessage: "Checking if reset is safe...", progress: 5 });
      const safetyCheck = await matchResetService.validateResetOperation(props.selectedFixtureData.id);

      if (!safetyCheck.canReset) {
        setPhase("error", { statusMessage: "Cannot safely reset this match (blocked by server)", progress: 100 });
        toast({
          title: "Reset Not Safe",
          description: "Cannot safely reset this match data",
          variant: "destructive"
        });
        return;
      }

      const userConfirmed = await props.showResetDialog(safetyCheck.warnings);
      if (!userConfirmed) {
        props.resetSaveStatus();
        return;
      }

      props.resetState.startReset(props.selectedFixtureData.id);
      setPhase("saving", { statusMessage: "Resetting match data...", progress: 25 });

      toast({
        title: "Resetting Match...",
        description: "Please wait while we reset all match data"
      });

      setPhase("saving", { statusMessage: "Resetting UI...", progress: 35 });
      props.resetTimer();
      props.resetScore();
      props.resetEvents();
      props.resetCards();
      props.resetTracking();
      props.resetGoals();

      setPhase("saving", { statusMessage: "Resetting database...", progress: 65 });
      const resetResult = await matchResetService.resetMatchData(props.selectedFixtureData.id);

      if (resetResult.success) {
        props.resetState.completeReset(resetResult.timestamp);
        setPhase("cache", { statusMessage: "Clearing cache...", progress: 80 });
        await props.cacheManager.invalidateMatchQueries(props.selectedFixtureData.id);

        if (props.forceRefresh) {
          setPhase("refreshing", { statusMessage: "Refreshing local data...", progress: 90 });
          await props.forceRefresh();
        }

        setPhase("success", { statusMessage: "Match Data Reset Complete", progress: 100 });
        props.resetSaveStatus &&
          setTimeout(props.resetSaveStatus, 1500);

        toast({
          title: "✅ Match Data Reset Complete",
          description: "All match data has been cleared and UI refreshed"
        });

        props.addEvent('Reset', 'Match data completely reset with state coordination', 0);
        console.log('✅ useMatchResetHandler: Enhanced match data reset completed successfully');

      } else {
        props.resetState.clearResetState();
        setPhase("error", { statusMessage: "Reset partial success", errorMessage: resetResult.message, progress: 100 });
        toast({
          title: "Reset Partial Success",
          description: `${resetResult.message}\n\nErrors: ${resetResult.errors?.join(', ')}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      props.resetState.clearResetState();
      setPhase("error", { statusMessage: "Reset failed", errorMessage: error?.message || "Unknown error", progress: 100 });
      console.error('❌ useMatchResetHandler: Failed to reset match data:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset match data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { handleResetMatchData };
};
