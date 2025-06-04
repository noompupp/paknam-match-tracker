
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
}

interface PlayerTimeManagementProps {
  allPlayers: Player[];
  selectedTimePlayer: string;
  matchTime: number;
  setSelectedTimePlayer: (value: string) => void;
  addPlayer: (player: any) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
  addEvent: (type: string, description: string, time: number) => void;
}

export const usePlayerTimeManagement = ({
  allPlayers,
  selectedTimePlayer,
  matchTime,
  setSelectedTimePlayer,
  addPlayer,
  removePlayer,
  togglePlayerTime,
  addEvent
}: PlayerTimeManagementProps) => {
  const { toast } = useToast();

  // All players available for time tracking
  const playersForTracking = allPlayers;

  const handleAddPlayer = () => {
    if (!selectedTimePlayer) {
      toast({
        title: "Error",
        description: "Please select a player to track.",
        variant: "destructive",
      });
      return;
    }

    const player = playersForTracking.find(p => p.id.toString() === selectedTimePlayer);
    if (!player) {
      toast({
        title: "Error",
        description: "Selected player not found.",
        variant: "destructive",
      });
      return;
    }

    addPlayer(player);
    addEvent('player_added', `Started tracking time for ${player.name} (${player.team})`, matchTime);
    setSelectedTimePlayer("");
    
    toast({
      title: "Player Added",
      description: `Now tracking playing time for ${player.name}`,
    });
  };

  const handleRemovePlayer = (playerId: number) => {
    const player = playersForTracking.find(p => p.id === playerId);
    if (player) {
      removePlayer(playerId);
      addEvent('player_removed', `Stopped tracking time for ${player.name}`, matchTime);
      
      toast({
        title: "Player Removed",
        description: `Stopped tracking ${player.name}`,
      });
    }
  };

  const handleTogglePlayerTime = (playerId: number) => {
    const player = playersForTracking.find(p => p.id === playerId);
    if (player) {
      togglePlayerTime(playerId);
      // The addEvent will be handled by the toggle function itself
    }
  };

  return {
    playersForTracking,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime
  };
};
