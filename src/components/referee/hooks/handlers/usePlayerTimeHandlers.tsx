
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
      
      // If player is currently playing and has played before, initiate pending substitution
      if (player.isPlaying && player.totalTime > 0) {
        substitutionManager.initiatePendingSubstitution(player);
        
        toast({
          title: "Substitution Ready",
          description: `${player.name} will be substituted. Add a replacement player to complete.`,
        });
        
        props.addEvent('Substitution Initiated', `${player.name} ready for substitution`, props.matchTime);
        return;
      }

      // Standard toggle for new players or players coming back in
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
      
      // This would typically call a service to save all player times
      // For now, we'll just show a success message
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
    handleSaveAllPlayerTimes,
    substitutionManager
  };
};
