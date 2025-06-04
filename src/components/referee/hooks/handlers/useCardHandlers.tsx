
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

      // For now, we'll need the fixture data to get team ID - this should be passed in
      // This is a temporary implementation until we refactor the card system completely
      const cardResult = await props.addCard(player, team, props.matchTime, cardType);
      props.addEvent('Card', `${cardType} card for ${playerName} (${team})`, props.matchTime);
      
      if (cardResult && cardResult.isSecondYellow) {
        props.addEvent('Red Card', `Second yellow card - automatic red for ${playerName}`, props.matchTime);
        toast({
          title: "Second Yellow Card",
          description: `${playerName} receives automatic red card for second yellow`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Card Issued",
          description: `${cardType} card given to ${playerName} and member stats updated`,
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
