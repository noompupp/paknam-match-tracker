
import { useDetailedGoalHandler } from "./DetailedGoalHandler";
import { useMatchStore } from "@/stores/useMatchStore";
import { ComponentPlayer } from "../../../hooks/useRefereeState";

interface DetailedGoalActionsProps {
  selectedFixtureData: any;
  forceRefresh?: () => Promise<void>;
  onAssignGoal: (player: ComponentPlayer) => void;
  children: (actions: {
    handleWizardGoalAssigned: (goalData: {
      player: ComponentPlayer;
      goalType: 'goal' | 'assist';
      team: 'home' | 'away';
      isOwnGoal?: boolean;
      assistPlayer?: ComponentPlayer;
      isEdit?: boolean;
      originalGoalId?: string | number;
    }) => Promise<void>;
  }) => React.ReactNode;
}

const DetailedGoalActions = ({
  selectedFixtureData,
  forceRefresh,
  onAssignGoal,
  children
}: DetailedGoalActionsProps) => {
  const { triggerUIUpdate } = useMatchStore();

  // Enhanced detailed goal handling
  const { handleWizardGoalAssigned } = useDetailedGoalHandler({
    onAssignGoal,
    forceRefresh: async () => {
      console.log('🔄 DetailedGoalActions: Enhanced detailed goal refresh');
      
      // Original force refresh
      if (forceRefresh) {
        await forceRefresh();
      }
      
      // Additional UI refresh
      setTimeout(() => {
        triggerUIUpdate();
        console.log('🔄 DetailedGoalActions: Additional UI refresh after detailed goal processing');
      }, 100);
    }
  });

  return <>{children({ handleWizardGoalAssigned })}</>;
};

export default DetailedGoalActions;
