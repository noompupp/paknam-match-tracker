
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
}

interface PlayerCardManagementProps {
  allPlayers: Player[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  matchTime: number;
  setSelectedPlayer: (value: string) => void;
  addCard: (player: string, team: string, type: string, time: number) => void;
  addEvent: (type: string, description: string, time: number) => void;
  checkForSecondYellow: (playerName: string) => boolean;
  formatTime: (seconds: number) => string;
}

export const usePlayerCardManagement = ({
  allPlayers,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  matchTime,
  setSelectedPlayer,
  addCard,
  addEvent,
  checkForSecondYellow,
  formatTime
}: PlayerCardManagementProps) => {
  const { toast } = useToast();

  // Filter players for cards based on selected team
  const playersForCards = allPlayers.filter(player => {
    if (!selectedTeam) return false;
    return player.team === selectedTeam;
  });

  const handleAddCard = () => {
    if (!selectedPlayer || !selectedTeam) {
      toast({
        title: "Error",
        description: "Please select both a player and team.",
        variant: "destructive",
      });
      return;
    }

    const player = playersForCards.find(p => p.id.toString() === selectedPlayer);
    if (!player) {
      toast({
        title: "Error",
        description: "Selected player not found in the selected team.",
        variant: "destructive",
      });
      return;
    }

    // Check for second yellow card
    if (selectedCardType === 'yellow' && checkForSecondYellow(player.name)) {
      toast({
        title: "Warning",
        description: `${player.name} already has a yellow card. This will result in a red card.`,
      });
    }

    addCard(player.name, selectedTeam, selectedCardType, matchTime);
    addEvent('card', `${selectedCardType} card for ${player.name} (${selectedTeam})`, matchTime);
    
    // Reset selections
    setSelectedPlayer("");
    
    toast({
      title: "Card Added",
      description: `${selectedCardType} card given to ${player.name} at ${formatTime(matchTime)}`,
    });
  };

  return {
    playersForCards,
    handleAddCard
  };
};
