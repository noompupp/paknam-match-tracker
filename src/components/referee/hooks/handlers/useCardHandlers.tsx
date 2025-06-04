
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { assignCardToPlayer } from "@/services/fixtures/simplifiedCardService";

interface UseCardHandlersProps {
  allPlayers: ComponentPlayer[];
  matchTime: number;
  addCard: (player: ComponentPlayer, team: string, matchTime: number, cardType: 'yellow' | 'red') => any;
  addEvent: (type: string, description: string, time: number) => void;
}

export const useCardHandlers = (props: UseCardHandlersProps) => {
  const { toast } = useToast();

  const handleAddCard = async (playerName: string, team: string, cardType: "yellow" | "red", time: number) => {
    const player = props.allPlayers.find(p => p.name === playerName);
    if (!player) {
      toast({
        title: "Error",
        description: "Player not found",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🟨🟥 useCardHandlers: Adding card with simplified service:', {
        player: player.name,
        team: player.team,
        cardType,
        time
      });

      // Use the simplified card service directly
      const cardResult = await assignCardToPlayer({
        fixtureId: props.allPlayers[0]?.fixtureId || 0, // Get fixture ID from player context
        playerId: player.id,
        playerName: player.name,
        teamId: player.teamId || team, // Use player's team ID or fallback to team name
        cardType,
        eventTime: time
      });

      // Add local event for immediate UI feedback
      props.addEvent('Card', `${cardType} card for ${playerName} (${team})`, time);
      
      if (cardResult && cardResult.isSecondYellow) {
        props.addEvent('Red Card', `Second yellow card - automatic red for ${playerName}`, time);
        toast({
          title: "Second Yellow Card",
          description: `${playerName} receives automatic red card for second yellow`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Card Issued",
          description: `${cardType} card given to ${playerName} and stats updated`,
        });
      }
    } catch (error) {
      console.error('❌ useCardHandlers: Failed to add card:', error);
      
      let errorMessage = 'Failed to add card';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Card Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    handleAddCard
  };
};
