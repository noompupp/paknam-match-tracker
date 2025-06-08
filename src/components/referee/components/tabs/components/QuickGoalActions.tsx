
import { useQuickGoalHandler } from "./QuickGoalHandler";
import { realTimeDataSync } from "@/services/realTimeDataSync";

interface QuickGoalActionsProps {
  selectedFixtureData: any;
  matchTime: number;
  formatTime: (seconds: number) => string;
  forceRefresh?: () => Promise<void>;
  onSaveMatch: () => void;
  children: (actions: {
    isProcessingQuickGoal: boolean;
    handleQuickGoal: (team: 'home' | 'away') => Promise<void>;
  }) => React.ReactNode;
}

const QuickGoalActions = ({
  selectedFixtureData,
  matchTime,
  formatTime,
  forceRefresh,
  onSaveMatch,
  children
}: QuickGoalActionsProps) => {
  // Quick goal handling
  const { isProcessingQuickGoal, handleQuickGoal } = useQuickGoalHandler({
    selectedFixtureData,
    matchTime,
    formatTime,
    forceRefresh: async () => {
      console.log('🔄 QuickGoalActions: Enhanced force refresh with comprehensive sync');
      
      // Enhanced refresh with real-time sync
      if (selectedFixtureData?.id) {
        await realTimeDataSync.forceGoalResync(selectedFixtureData.id);
      }
      
      // Trigger original force refresh
      if (forceRefresh) {
        await forceRefresh();
      }
    },
    onSaveMatch
  });

  return <>{children({ isProcessingQuickGoal, handleQuickGoal })}</>;
};

export default QuickGoalActions;
