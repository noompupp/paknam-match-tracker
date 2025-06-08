
import { ComponentPlayer } from "../../../hooks/useRefereeState";

interface DetailedGoalHandlerProps {
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
}

export const useDetailedGoalHandler = ({
  onAssignGoal,
  forceRefresh
}: DetailedGoalHandlerProps) => {
  
  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
  }) => {
    console.log('🎯 DetailedGoalHandler: Goal assigned via wizard:', goalData);
    onAssignGoal(goalData.player);
    
    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      setTimeout(() => {
        onAssignGoal(goalData.assistPlayer!);
      }, 100);
    }
    
    // Trigger immediate score refresh after wizard goal assignment
    if (forceRefresh && goalData.goalType === 'goal') {
      console.log('🔄 DetailedGoalHandler: Triggering immediate score refresh after wizard goal assignment');
      setTimeout(() => {
        forceRefresh();
      }, 200);
    }
  };

  return {
    handleWizardGoalAssigned
  };
};
