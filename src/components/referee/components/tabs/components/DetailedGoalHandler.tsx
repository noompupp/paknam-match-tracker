
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
  const { updateGoal, removeGoal, addGoal, addAssist, goals } = useMatchStore();

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

        // Enhanced local store update with multiple matching strategies
        console.log('🔄 DetailedGoalHandler: Updating local store with enhanced matching');
        const currentGoals = useMatchStore.getState().goals;
        console.log('📊 DetailedGoalHandler: Current goals in store:', currentGoals.length);

        // Strategy 1: Find by exact database ID match
        let goalToUpdate = currentGoals.find(g => 
          g.id === String(goalData.originalGoalId) || 
          g.id === goalData.originalGoalId
        );

        // Strategy 2: Find "Quick Goal" by time match (with tolerance)
        if (!goalToUpdate) {
          const eventTime = updatedEvent.event_time || 0;
          goalToUpdate = currentGoals.find(g => 
            g.playerName === 'Quick Goal' && 
            Math.abs(g.time - eventTime) <= 5 // 5 second tolerance
          );
          console.log('🔍 DetailedGoalHandler: Time-based match found:', !!goalToUpdate, 'for event time:', eventTime);
        }

        // Strategy 3: Find any unassigned goal for this team
        if (!goalToUpdate) {
          goalToUpdate = currentGoals.find(g => 
            (g.playerName === 'Quick Goal' || g.playerName === 'Unknown Player') &&
            g.team === goalData.team &&
            g.type === 'goal'
          );
          console.log('🔍 DetailedGoalHandler: Team-based unassigned match found:', !!goalToUpdate);
        }

        if (goalToUpdate) {
          console.log('✅ DetailedGoalHandler: Updating local store goal:', goalToUpdate.id);
          updateGoal(goalToUpdate.id, {
            playerId: goalData.player.id,
            playerName: goalData.player.name,
            synced: true
          });
          
          toast({
            title: "Goal Updated!",
            description: `Goal assigned to ${goalData.player.name}`,
          });
        } else {
          console.warn('⚠️ DetailedGoalHandler: Could not find matching goal in local store for update');
          // Force a complete refresh if we can't find the goal to update
          if (forceRefresh) {
            console.log('🔄 DetailedGoalHandler: Forcing complete refresh due to matching failure');
            setTimeout(() => {
              forceRefresh();
            }, 100);
          }
          
          toast({
            title: "Goal Updated!",
            description: `Goal assigned to ${goalData.player.name}. Refreshing data...`,
          });
        }

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
              teamId: goalToUpdate?.teamId || '',
              teamName: goalToUpdate?.teamName || '',
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

      // Enhanced refresh with shorter delay for immediate feedback
      if (forceRefresh) {
        console.log('🔄 DetailedGoalHandler: Triggering enhanced refresh after goal processing');
        setTimeout(() => {
          forceRefresh();
        }, 100); // Reduced from 200ms to 100ms for faster feedback
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
