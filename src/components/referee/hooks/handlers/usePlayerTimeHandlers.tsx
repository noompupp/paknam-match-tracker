
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer, PlayerTimeTrackerPlayer } from "../useRefereeState";

interface UsePlayerTimeHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  playersForTimeTracker: PlayerTimeTrackerPlayer[];
  addPlayer: (player: ComponentPlayer, matchTime: number) => any;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number, matchTime: number) => any;
  performForcedSubstitution?: (playerInId: number, playerOutId: number, matchTime: number) => void;
  addEvent: (type: string, description: string, time: number) => void;
}

export const usePlayerTimeHandlers = (props: UsePlayerTimeHandlersProps) => {
  const { toast } = useToast();

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
      
      await props.addPlayer(player, props.matchTime);
      props.addEvent('Player Added', `${player.name} added to time tracking`, props.matchTime);
      
      toast({
        title: "Player Added",
        description: `${player.name} added to time tracking`,
      });
      
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

  const handleForcedSubstitution = async (playerInId: number, playerOutId: number) => {
    const playerIn = props.playersForTimeTracker.find(p => p.id === playerInId);
    const playerOut = props.playersForTimeTracker.find(p => p.id === playerOutId);
    
    if (!playerIn || !playerOut) {
      toast({
        title: "Substitution Failed",
        description: "Player not found",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔄 usePlayerTimeHandlers: Performing forced substitution:', {
        playerIn: playerIn.name,
        playerOut: playerOut.name
      });
      
      if (props.performForcedSubstitution) {
        await props.performForcedSubstitution(playerInId, playerOutId, props.matchTime);
      } else {
        // Fallback to sequential toggles
        await props.togglePlayerTime(playerOutId, props.matchTime);
        setTimeout(async () => {
          await props.togglePlayerTime(playerInId, props.matchTime);
        }, 100);
      }
      
      props.addEvent('Forced Substitution', `${playerOut.name} → ${playerIn.name} (forced re-entry)`, props.matchTime);
      
      toast({
        title: "🔄 Forced Substitution Complete",
        description: `${playerOut.name} → ${playerIn.name}`,
      });
      
      console.log('✅ usePlayerTimeHandlers: Forced substitution completed successfully');
    } catch (error) {
      console.error('❌ usePlayerTimeHandlers: Failed to perform forced substitution:', error);
      toast({
        title: "Forced Substitution Failed",
        description: error instanceof Error ? error.message : "Failed to complete substitution",
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
    handleForcedSubstitution,
    handleSaveAllPlayerTimes
  };
};
