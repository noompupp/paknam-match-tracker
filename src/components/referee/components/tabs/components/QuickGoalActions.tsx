
import { useQuickGoalHandler } from "./QuickGoalHandler";

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
      console.log('🔄 QuickGoalActions: Enhanced force refresh');
      
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
