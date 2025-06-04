
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer } from "../useRefereeState";
import { assignCardToPlayer } from "@/services/fixtures/simplifiedCardService";
import { resolveTeamIdForMatchEvent, normalizeTeamIdForDatabase } from "@/utils/teamIdMapping";

interface UseCardHandlersProps {
  allPlayers: ComponentPlayer[];
  matchTime: number;
  selectedFixtureData: any;
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

    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🟨🟥 useCardHandlers: Adding card with improved team ID resolution:', {
        player: player.name,
        team: player.team,
        cardType,
        time,
        fixture: props.selectedFixtureData.id
      });

      // Validate team data
      if (!props.selectedFixtureData.home_team || !props.selectedFixtureData.away_team) {
        throw new Error('Missing team data in fixture');
      }

      // Use the new team ID resolution utility
      const teamId = resolveTeamIdForMatchEvent(
        player.team,
        {
          id: props.selectedFixtureData.home_team_id || props.selectedFixtureData.home_team?.id?.toString(),
          name: props.selectedFixtureData.home_team?.name,
          __id__: props.selectedFixtureData.home_team?.__id__ || props.selectedFixtureData.home_team_id
        },
        {
          id: props.selectedFixtureData.away_team_id || props.selectedFixtureData.away_team?.id?.toString(),
          name: props.selectedFixtureData.away_team?.name,
          __id__: props.selectedFixtureData.away_team?.__id__ || props.selectedFixtureData.away_team_id
        }
      );

      const normalizedTeamId = normalizeTeamIdForDatabase(teamId);

      console.log('🔍 useCardHandlers: Team ID resolution result:', {
        playerTeam: player.team,
        resolvedTeamId: teamId,
        normalizedTeamId,
        homeTeam: props.selectedFixtureData.home_team?.name,
        awayTeam: props.selectedFixtureData.away_team?.name
      });

      // Use the simplified card service directly
      const cardResult = await assignCardToPlayer({
        fixtureId: props.selectedFixtureData.id,
        playerId: player.id,
        playerName: player.name,
        teamId: normalizedTeamId,
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
