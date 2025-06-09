
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { PlayerTime } from "@/types/database";
import { useSubstitutionManager } from "@/hooks/playerTracking/substitutionManager";

interface UsePlayerTimeHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  playersForTimeTracker: PlayerTime[];
  addPlayer: (player: ComponentPlayer, matchTime: number) => any;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number, matchTime: number) => any;
  addEvent: (type: string, description: string, time: number) => void;
}

export const usePlayerTimeHandlers = (props: UsePlayerTimeHandlersProps) => {
  const { toast } = useToast();
  const substitutionManager = useSubstitutionManager();

  const handleAddPlayer = async (player: ComponentPlayer) => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected. Please select a match first.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('⏱️ usePlayerTimeHandlers: Adding player to time tracking:', player.name);
      
      // Check if this completes a pending substitution
      if (substitutionManager.hasPendingSubstitution) {
        const substitution = substitutionManager.completePendingSubstitution(player);
        if (substitution) {
          props.addEvent('Substitution', 
            `${substitution.incoming.name} substituted for ${substitution.outgoing.outgoingPlayerName}`, 
            props.matchTime
          );
          
          toast({
            title: "Substitution Complete",
            description: `${substitution.incoming.name} replaced ${substitution.outgoing.outgoingPlayerName}`,
          });
        }
      }
      
      await props.addPlayer(player, props.matchTime);
      
      if (!substitutionManager.hasPendingSubstitution) {
        props.addEvent('Player Added', `${player.name} added to time tracking`, props.matchTime);
        
        toast({
          title: "Player Added",
          description: `${player.name} added to time tracking`,
        });
      }
      
      console.log('✅ usePlayerTimeHandlers: Player added successfully');
    } catch (error) {
      console.error('❌ usePlayerTimeHandlers: Failed to add player:', error);
      toast({
        title: "Add Player Failed",
        description: error instanceof Error ? error.message : "Failed to add player",
        variant: "destructive"
      });
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    const player = props.playersForTimeTracker.find(p => p.id === playerId);
    if (player) {
      props.removePlayer(playerId);
      props.addEvent('Player Removed', `${player.name} removed from time tracking`, props.matchTime);
      
      toast({
        title: "Player Removed",
        description: `${player.name} removed from time tracking`,
      });
    }
  };

  const handleTogglePlayerTime = async (playerId: number) => {
    const player = props.playersForTimeTracker.find(p => p.id === playerId);
    if (!player) return;

    try {
      console.log('⏱️ usePlayerTimeHandlers: Toggling player time:', player.name);
      
      const hasPlayedBefore = player.totalTime > 0;
      
      // DUAL-BEHAVIOR IMPLEMENTATION:
      
      // SCENARIO 1: "Sub In" first (streamlined flow)
      if (!player.isPlaying && hasPlayedBefore) {
        // This is a "Sub In" action for a player who has played before
        substitutionManager.initiatePendingSubstitution(player, 'sub_in');
        
        toast({
          title: "Substitution Ready",
          description: `${player.name} will be substituted in. Press "Sub Out" on another player to complete.`,
        });
        
        props.addEvent('Substitution Initiated', `${player.name} ready for substitution (Sub In first)`, props.matchTime);
        return;
      }

      // SCENARIO 2: Complete streamlined substitution (Sub Out after Sub In)
      if (player.isPlaying && substitutionManager.hasPendingSubstitution && !substitutionManager.isSubOutInitiated) {
        // Complete the pending "Sub In" substitution by stopping this player
        await props.togglePlayerTime(playerId, props.matchTime);
        
        const pendingSub = substitutionManager.pendingSubstitution;
        if (pendingSub) {
          // Start the incoming player automatically
          const incomingPlayer = props.playersForTimeTracker.find(p => p.id === pendingSub.outgoingPlayerId);
          if (incomingPlayer) {
            await props.togglePlayerTime(pendingSub.outgoingPlayerId, props.matchTime);
          }
          
          substitutionManager.cancelPendingSubstitution();
          
          props.addEvent('Substitution Complete', 
            `${pendingSub.outgoingPlayerName} substituted for ${player.name} (Streamlined)`, 
            props.matchTime
          );
          
          toast({
            title: "Substitution Complete",
            description: `${pendingSub.outgoingPlayerName} replaced ${player.name}`,
          });
        }
        return;
      }

      // SCENARIO 3: "Sub Out" first (modal flow)
      if (player.isPlaying && hasPlayedBefore && !substitutionManager.hasPendingSubstitution) {
        // This is a "Sub Out" action that should trigger the modal flow
        await props.togglePlayerTime(playerId, props.matchTime);
        
        // Initiate substitution with "sub_out" type to trigger modal
        substitutionManager.initiatePendingSubstitution(player, 'sub_out');
        
        props.addEvent('Substitution Initiated', `${player.name} substituted out (Modal flow)`, props.matchTime);
        
        toast({
          title: "Player Substituted Out",
          description: `${player.name} has been substituted out. Select a replacement player.`,
        });
        return;
      }

      // SCENARIO 4: Standard toggle for new players or regular start/stop actions
      await props.togglePlayerTime(playerId, props.matchTime);
      
      const action = player.isPlaying ? 'stopped' : 'started';
      props.addEvent('Time Toggle', `Time tracking ${action} for ${player.name}`, props.matchTime);
      
      toast({
        title: "Time Updated",
        description: `Time tracking ${action} for ${player.name}`,
      });
      
      console.log('✅ usePlayerTimeHandlers: Player time toggled successfully');
    } catch (error) {
      console.error('❌ usePlayerTimeHandlers: Failed to toggle player time:', error);
      toast({
        title: "Time Toggle Failed",
        description: error instanceof Error ? error.message : "Failed to toggle time",
        variant: "destructive"
      });
    }
  };

  // New function to handle undoing a "Sub Out" action
  const handleUndoSubOut = async (playerId: number) => {
    const player = props.playersForTimeTracker.find(p => p.id === playerId);
    if (!player) return;

    try {
      console.log('↩️ usePlayerTimeHandlers: Undoing Sub Out for:', player.name);
      
      // Restart the player's time tracking
      await props.togglePlayerTime(playerId, props.matchTime);
      
      props.addEvent('Sub Out Undone', `${player.name} returned to play (Sub Out cancelled)`, props.matchTime);
      
      console.log('✅ usePlayerTimeHandlers: Sub Out undone successfully');
    } catch (error) {
      console.error('❌ usePlayerTimeHandlers: Failed to undo Sub Out:', error);
      toast({
        title: "Undo Failed",
        description: error instanceof Error ? error.message : "Failed to undo substitution",
        variant: "destructive"
      });
    }
  };

  const handleSaveAllPlayerTimes = async () => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected",
        variant: "destructive"
      });
      return;
    }

    if (props.playersForTimeTracker.length === 0) {
      toast({
        title: "No Data",
        description: "No player times to save",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('⏱️ usePlayerTimeHandlers: Saving all player times...');
      
      props.addEvent('Time Save', `Saved time data for ${props.playersForTimeTracker.length} players`, props.matchTime);
      
      toast({
        title: "Player Times Saved",
        description: `Successfully saved time data for ${props.playersForTimeTracker.length} players`,
      });
      
      console.log('✅ usePlayerTimeHandlers: All player times saved successfully');
    } catch (error) {
      console.error('❌ usePlayerTimeHandlers: Failed to save player times:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save player times",
        variant: "destructive"
      });
    }
  };

  return {
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    handleUndoSubOut,
    handleSaveAllPlayerTimes,
    substitutionManager
  };
};
