
import { useToast } from "@/hooks/use-toast";
import { useMatchStore } from "@/stores/useMatchStore";

// Add an optional refreshScore callback prop.
interface UseGoalSaveHandlerProps {
  fixtureId?: number;
  refreshScore?: () => Promise<void> | void;
}

// This hook only syncs local goals to DB and will now support UI score refresh on success.
export const useGoalSaveHandler = ({ fixtureId, refreshScore }: UseGoalSaveHandlerProps) => {
  const { toast } = useToast();
  const syncGoalsToDatabase = useMatchStore(s => s.syncGoalsToDatabase);

  const handleSaveGoals = async () => {
    console.log('[useGoalSaveHandler] Triggered with fixtureId:', fixtureId);
    if (!fixtureId) {
      toast({
        title: "No Fixture Selected",
        description: "Could not save goals because the fixture was not found.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Saving Goals...",
      description: "Syncing goals to the database.",
    });

    try {
      console.log('[useGoalSaveHandler] About to call syncGoalsToDatabase');
      await syncGoalsToDatabase(fixtureId);
      console.log('[useGoalSaveHandler] syncGoalsToDatabase completed.');

      // Refresh the score AFTER syncing to database
      if (refreshScore) {
        console.log('[useGoalSaveHandler] Awaiting post-save refreshScore callback...');
        await refreshScore();
        console.log('[useGoalSaveHandler] refreshScore completed.');
      } else {
        console.log('[useGoalSaveHandler] No refreshScore callback provided.');
      }

      toast({
        title: "✅ Goals Saved",
        description: "All goals are now saved to the server and score is refreshed.",
      });
    } catch (err: any) {
      toast({
        title: "Goal Save Failed",
        description: err?.message || "There was an error saving the goals. Please try again.",
        variant: "destructive"
      });
      console.error('[useGoalSaveHandler] Error:', err);
      throw err; // Let parent component catch if needed
    }
  };

  return { handleSaveGoals };
};
