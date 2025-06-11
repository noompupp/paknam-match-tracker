
import { useMatchStore } from "@/stores/useMatchStore";
import { ComponentPlayer } from "../../../hooks/useRefereeState";

interface DetailedGoalHandlerProps {
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
}

export const useDetailedGoalHandler = ({
  onAssignGoal,
  forceRefresh
}: DetailedGoalHandlerProps) => {
  const { addGoal, addAssist, addEvent } = useMatchStore();

  const handleWizardGoalAssigned = async (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => {
    console.log('🎯 DetailedGoalHandler: Enhanced wizard goal assignment:', goalData);
    
    try {
      // Extract team information (assuming it's available in the context)
      const teamId = goalData.team === 'home' ? 'home_team_id' : 'away_team_id';
      const teamName = goalData.team === 'home' ? 'Home Team' : 'Away Team';
      const matchTime = Date.now(); // This should come from match context

      if (goalData.goalType === 'goal') {
        // Add the main goal
        addGoal({
          playerId: goalData.player.id,
          playerName: goalData.player.name,
          team: goalData.team,
          teamId,
          teamName,
          type: 'goal',
          time: matchTime,
          isOwnGoal: goalData.isOwnGoal
        });

        // Add assist if provided and not an own goal
        if (goalData.assistPlayer && !goalData.isOwnGoal) {
          addAssist({
            playerId: goalData.assistPlayer.id,
            playerName: goalData.assistPlayer.name,
            team: goalData.team,
            teamId,
            teamName,
            time: matchTime
          });
        }
      } else if (goalData.goalType === 'assist') {
        // Add just the assist
        addAssist({
          playerId: goalData.player.id,
          playerName: goalData.player.name,
          team: goalData.team,
          teamId,
          teamName,
          time: matchTime
        });
      }

      addEvent('Goal Assignment', `Detailed goal assigned to ${goalData.player.name}`, matchTime);
      
      // Call the assignment handler
      onAssignGoal(goalData.player);
      
      // Enhanced force refresh
      if (forceRefresh) {
        await forceRefresh();
        console.log('🔄 DetailedGoalHandler: Enhanced force refresh completed');
      }
    } catch (error) {
      console.error('❌ DetailedGoalHandler: Error processing detailed goal assignment:', error);
    }
  };

  return {
    handleWizardGoalAssigned
  };
};
