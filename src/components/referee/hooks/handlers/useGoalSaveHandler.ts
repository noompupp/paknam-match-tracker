
import { useToast } from "@/hooks/use-toast";
import { useMatchStore } from "@/stores/useMatchStore";

// This hook only syncs local goals to DB.
export const useGoalSaveHandler = ({ fixtureId }: { fixtureId?: number }) => {
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
      toast({
        title: "✅ Goals Saved",
        description: "All goals are now saved to the server.",
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
