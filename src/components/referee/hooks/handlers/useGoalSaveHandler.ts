
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
      await syncGoalsToDatabase(fixtureId);

      // Refresh the score AFTER syncing to database
      if (refreshScore) {
        await refreshScore();
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
      throw err; // Let parent component catch if needed
    }
  };

  return { handleSaveGoals };
};
