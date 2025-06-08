
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { supabase } from "@/integrations/supabase/client";

interface DetailedGoalHandlerProps {
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
}

export const useDetailedGoalHandler = ({
  onAssignGoal,
  forceRefresh
}: DetailedGoalHandlerProps) => {
  const { toast } = useToast();

  const handleWizardGoalAssigned = async (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => {
    console.log('🎯 DetailedGoalHandler: Processing goal assignment:', goalData);

    try {
      if (goalData.isEdit && goalData.originalGoalId) {
        // Handle editing existing goal - update the match event
        console.log('✏️ DetailedGoalHandler: Updating existing goal:', goalData.originalGoalId);
        
        const { data: updatedEvent, error } = await supabase
          .from('match_events')
          .update({
            player_name: goalData.player.name
          })
          .eq('id', Number(goalData.originalGoalId))
          .select()
          .single();

        if (error) {
          console.error('❌ DetailedGoalHandler: Error updating goal:', error);
          toast({
            title: "Update Failed",
            description: "Failed to update the goal with player details",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ DetailedGoalHandler: Goal updated successfully:', updatedEvent);

        // Update player stats (goals) - handle missing goals property by defaulting to 0
        const { error: statsError } = await supabase
          .from('members')
          .update({
            goals: ((goalData.player as any).goals || 0) + 1
          })
          .eq('id', goalData.player.id);

        if (statsError) {
          console.error('❌ DetailedGoalHandler: Error updating player stats:', statsError);
          // Don't fail the whole operation for stats update failure
        } else {
          console.log('✅ DetailedGoalHandler: Player stats updated');
        }

        toast({
          title: "Goal Updated!",
          description: `Goal assigned to ${goalData.player.name}`,
        });

        // Handle assist player if provided and not an own goal
        if (goalData.assistPlayer && !goalData.isOwnGoal) {
          setTimeout(() => {
            console.log('🎯 DetailedGoalHandler: Processing assist player:', goalData.assistPlayer);
            onAssignGoal(goalData.assistPlayer!);
          }, 100);
        }
      } else {
        // Handle new goal creation
        console.log('🆕 DetailedGoalHandler: Creating new goal');
        onAssignGoal(goalData.player);

        // Handle assist player if provided and not an own goal
        if (goalData.assistPlayer && !goalData.isOwnGoal) {
          setTimeout(() => {
            console.log('🎯 DetailedGoalHandler: Processing assist player:', goalData.assistPlayer);
            onAssignGoal(goalData.assistPlayer!);
          }, 100);
        }
      }

      // Trigger refresh after processing
      if (forceRefresh) {
        console.log('🔄 DetailedGoalHandler: Triggering refresh after goal processing');
        setTimeout(() => {
          forceRefresh();
        }, 500);
      }

    } catch (error) {
      console.error('❌ DetailedGoalHandler: Unexpected error:', error);
      toast({
        title: "Processing Failed",
        description: "An unexpected error occurred while processing the goal",
        variant: "destructive"
      });
    }
  };

  return {
    handleWizardGoalAssigned
  };
};
