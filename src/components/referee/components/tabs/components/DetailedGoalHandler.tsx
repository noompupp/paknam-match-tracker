
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { supabase } from "@/integrations/supabase/client";
import { useMatchStore } from "@/stores/useMatchStore";
import { realTimeDataSync } from "@/services/realTimeDataSync";

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
    console.log('🎯 DetailedGoalHandler: Processing goal assignment with enhanced sync:', goalData);

    try {
      if (goalData.isEdit && goalData.originalGoalId) {
        // Handle editing existing goal with enhanced real-time sync
        console.log('✏️ DetailedGoalHandler: Updating existing goal with real-time sync:', goalData.originalGoalId);
        
        // Update database first
        const { data: updatedEvent, error } = await supabase
          .from('match_events')
          .update({
            player_name: goalData.player.name
          })
          .eq('id', Number(goalData.originalGoalId))
          .select()
          .single();

        if (error) {
          console.error('❌ DetailedGoalHandler: Database update failed:', error);
          toast({
            title: "Update Failed",
            description: "Failed to update the goal in database",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ DetailedGoalHandler: Database updated successfully:', updatedEvent);

        // Update player stats
        const { error: statsError } = await supabase
          .from('members')
          .update({
            goals: ((goalData.player as any).goals || 0) + 1
          })
          .eq('id', goalData.player.id);

        if (statsError) {
          console.error('❌ DetailedGoalHandler: Player stats update failed:', statsError);
        } else {
          console.log('✅ DetailedGoalHandler: Player stats updated');
        }

        // Enhanced real-time local store sync
        const syncResult = await realTimeDataSync.syncGoalDetailsUpdate(
          goalData.originalGoalId,
          goalData.player.name
        );

        if (syncResult.success && syncResult.localStoreUpdated) {
          console.log('🚀 DetailedGoalHandler: Real-time sync successful');
          toast({
            title: "Goal Updated!",
            description: `Goal assigned to ${goalData.player.name} and synced in real-time`,
          });
        } else {
          console.warn('⚠️ DetailedGoalHandler: Real-time sync had issues:', syncResult.errors);
          
          // Fallback: Force refresh if real-time sync fails
          if (forceRefresh) {
            console.log('🔄 DetailedGoalHandler: Triggering fallback refresh');
            setTimeout(() => {
              forceRefresh();
            }, 100);
          }
          
          toast({
            title: "Goal Updated!",
            description: `Goal assigned to ${goalData.player.name}. Syncing...`,
          });
        }

        // Handle assist player if provided and not an own goal
        if (goalData.assistPlayer && !goalData.isOwnGoal) {
          console.log('🎯 DetailedGoalHandler: Recording assist:', goalData.assistPlayer);
          
          const { error: assistStatsError } = await supabase
            .from('members')
            .update({
              assists: ((goalData.assistPlayer as any).assists || 0) + 1
            })
            .eq('id', goalData.assistPlayer.id);

          if (assistStatsError) {
            console.error('❌ DetailedGoalHandler: Assist stats update failed:', assistStatsError);
          } else {
            console.log('✅ DetailedGoalHandler: Assist stats updated');
            
            // Add assist to local store
            addAssist({
              playerId: goalData.assistPlayer.id,
              playerName: goalData.assistPlayer.name,
              team: goalData.team,
              teamId: updatedEvent.team_id || '',
              teamName: '', // Will be resolved by the store
              type: 'assist',
              time: updatedEvent.event_time || 0
            });
          }
        }
      } else {
        // Handle new goal creation
        console.log('🆕 DetailedGoalHandler: Creating new goal');
        onAssignGoal(goalData.player);

        // Handle assist player if provided and not an own goal
        if (goalData.assistPlayer && !goalData.isOwnGoal) {
          console.log('🎯 DetailedGoalHandler: Recording assist for new goal:', goalData.assistPlayer);
          
          const { error: assistStatsError } = await supabase
            .from('members')
            .update({
              assists: ((goalData.assistPlayer as any).assists || 0) + 1
            })
            .eq('id', goalData.assistPlayer.id);

          if (assistStatsError) {
            console.error('❌ DetailedGoalHandler: Assist stats update failed:', assistStatsError);
          } else {
            console.log('✅ DetailedGoalHandler: Assist stats updated for new goal');
          }
        }
      }

      // Enhanced refresh with shorter delay for immediate feedback
      if (forceRefresh) {
        console.log('🔄 DetailedGoalHandler: Triggering enhanced refresh after processing');
        setTimeout(() => {
          forceRefresh();
        }, 50); // Reduced from 100ms to 50ms for faster feedback
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
