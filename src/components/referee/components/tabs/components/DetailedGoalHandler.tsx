
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { supabase } from "@/integrations/supabase/client";
import { useMatchStore } from "@/stores/useMatchStore";

interface DetailedGoalHandlerProps {
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
}

export const useDetailedGoalHandler = ({
  onAssignGoal,
  forceRefresh
}: DetailedGoalHandlerProps) => {
  const { toast } = useToast();
  const { updateGoal, removeGoal, addGoal, addAssist } = useMatchStore();

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

        // Update local store - find and update the "Quick Goal" entry
        const { goals } = useMatchStore.getState();
        const quickGoalToUpdate = goals.find(g => 
          g.playerName === 'Quick Goal' && 
          g.time === (updatedEvent.event_time || 0)
        );

        if (quickGoalToUpdate) {
          console.log('🔄 DetailedGoalHandler: Updating local store goal:', quickGoalToUpdate.id);
          updateGoal(quickGoalToUpdate.id, {
            playerId: goalData.player.id,
            playerName: goalData.player.name,
            synced: true
          });
        } else {
          console.warn('⚠️ DetailedGoalHandler: Could not find matching quick goal in local store');
        }

        toast({
          title: "Goal Updated!",
          description: `Goal assigned to ${goalData.player.name}`,
        });

        // Handle assist player if provided and not an own goal
        if (goalData.assistPlayer && !goalData.isOwnGoal) {
          console.log('🎯 DetailedGoalHandler: Recording assist (without incrementing score):', goalData.assistPlayer);
          
          // Update assist player stats directly without calling onAssignGoal
          const { error: assistStatsError } = await supabase
            .from('members')
            .update({
              assists: ((goalData.assistPlayer as any).assists || 0) + 1
            })
            .eq('id', goalData.assistPlayer.id);

          if (assistStatsError) {
            console.error('❌ DetailedGoalHandler: Error updating assist player stats:', assistStatsError);
          } else {
            console.log('✅ DetailedGoalHandler: Assist player stats updated');
            
            // Add assist to local store
            addAssist({
              playerId: goalData.assistPlayer.id,
              playerName: goalData.assistPlayer.name,
              team: goalData.team,
              teamId: quickGoalToUpdate?.teamId || '',
              teamName: quickGoalToUpdate?.teamName || '',
              type: 'assist',
              time: updatedEvent.event_time || 0
            });
          }
        }
      } else {
        // Handle new goal creation - ONLY call onAssignGoal for the goal scorer
        console.log('🆕 DetailedGoalHandler: Creating new goal for scorer only');
        onAssignGoal(goalData.player);

        // Handle assist player if provided and not an own goal - DON'T call onAssignGoal for assists
        if (goalData.assistPlayer && !goalData.isOwnGoal) {
          console.log('🎯 DetailedGoalHandler: Recording assist (without incrementing score):', goalData.assistPlayer);
          
          // Update assist player stats directly without calling onAssignGoal to prevent score increment
          const { error: assistStatsError } = await supabase
            .from('members')
            .update({
              assists: ((goalData.assistPlayer as any).assists || 0) + 1
            })
            .eq('id', goalData.assistPlayer.id);

          if (assistStatsError) {
            console.error('❌ DetailedGoalHandler: Error updating assist player stats:', assistStatsError);
          } else {
            console.log('✅ DetailedGoalHandler: Assist player stats updated without score increment');
          }
        }
      }

      // Trigger refresh after processing with a shorter delay for immediate feedback
      if (forceRefresh) {
        console.log('🔄 DetailedGoalHandler: Triggering refresh after goal processing');
        setTimeout(() => {
          forceRefresh();
        }, 200);
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
