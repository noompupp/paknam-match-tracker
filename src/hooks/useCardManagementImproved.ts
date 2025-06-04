
import { useState } from "react";
import { useCreateCard } from "@/hooks/useCards";
import { cardsApi } from "@/services/cardsApi";
import { resolveTeamIdForMatchEvent } from "@/utils/teamIdMapping";
import { useToast } from "@/hooks/use-toast";

interface CardData {
  id: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  time: number;
  playerId: number;
  teamId: string; // Already correct as string
}

interface UseCardManagementImprovedProps {
  selectedFixtureData?: any;
}

export const useCardManagementImproved = ({ selectedFixtureData }: UseCardManagementImprovedProps = {}) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedCardType, setSelectedCardType] = useState<'yellow' | 'red'>('yellow');
  const createCard = useCreateCard();
  const { toast } = useToast();

  const addCard = async (
    player: any, 
    team: string, 
    matchTime: number, 
    cardType: 'yellow' | 'red'
  ) => {
    if (!selectedFixtureData) {
      throw new Error('No fixture selected');
    }

    if (!player || !team || !cardType) {
      throw new Error('Missing required card data');
    }

    console.log('🟨 useCardManagementImproved: Adding card with database integration:', {
      player: player.name || player,
      team,
      type: cardType,
      time: matchTime,
      fixture: selectedFixtureData.id
    });

    try {
      // Prepare team data for proper ID resolution
      const homeTeam = {
        id: selectedFixtureData.home_team_id,
        name: selectedFixtureData.home_team?.name,
        __id__: selectedFixtureData.home_team_id // Use text ID
      };
      
      const awayTeam = {
        id: selectedFixtureData.away_team_id,
        name: selectedFixtureData.away_team?.name,
        __id__: selectedFixtureData.away_team_id // Use text ID
      };

      // Validate team data
      if (!homeTeam.id || !homeTeam.name || !awayTeam.id || !awayTeam.name) {
        throw new Error('Invalid fixture team data');
      }

      // Check for second yellow card
      let isSecondYellow = false;
      if (cardType === 'yellow' && typeof player === 'object' && player.id) {
        isSecondYellow = await cardsApi.checkForSecondYellow(player.id, selectedFixtureData.id);
      }

      // Resolve the text team ID for the database
      const teamId = resolveTeamIdForMatchEvent(team, homeTeam, awayTeam);
      const playerId = typeof player === 'object' ? player.id : 0;
      const playerName = typeof player === 'object' ? player.name : player;

      // Save to database
      const savedCard = await createCard.mutateAsync({
        fixture_id: selectedFixtureData.id,
        player_id: playerId,
        player_name: playerName,
        team_id: teamId, // This is now a string
        card_type: cardType,
        event_time: matchTime,
        description: `${cardType} card for ${playerName} (${team})`
      });

      // Add to local state
      const newCard: CardData = {
        id: Date.now(), // Temporary ID for local state
        player: playerName,
        team,
        type: cardType,
        time: matchTime,
        playerId,
        teamId // This is now a string
      };

      setCards(prev => [...prev, newCard]);

      // Handle second yellow card -> automatic red
      if (isSecondYellow) {
        console.log('🟥 useCardManagementImproved: Second yellow detected, issuing automatic red');
        
        // Add automatic red card
        const redCard = await createCard.mutateAsync({
          fixture_id: selectedFixtureData.id,
          player_id: playerId,
          player_name: playerName,
          team_id: teamId, // This is now a string
          card_type: 'red',
          event_time: matchTime,
          description: `Automatic red card for ${playerName} (second yellow)`
        });

        const autoRedCard: CardData = {
          id: Date.now() + 1, // Ensure unique ID
          player: playerName,
          team,
          type: 'red',
          time: matchTime,
          playerId,
          teamId // This is now a string
        };

        setCards(prev => [...prev, autoRedCard]);

        return { success: true, isSecondYellow: true, cards: [newCard, autoRedCard] };
      }

      console.log('✅ useCardManagementImproved: Card successfully added to database and local state');
      return { success: true, isSecondYellow: false, cards: [newCard] };

    } catch (error) {
      console.error('❌ useCardManagementImproved: Error adding card:', error);
      throw error;
    }
  };

  const checkForSecondYellow = (playerName: string): boolean => {
    const existingYellows = cards.filter(
      card => card.player === playerName && card.type === 'yellow'
    );
    return existingYellows.length > 0;
  };

  const resetCards = () => {
    setCards([]);
    setSelectedPlayer("");
    setSelectedTeam("");
    setSelectedCardType('yellow');
  };

  const getPlayerCards = (playerName: string) => {
    return cards.filter(card => card.player === playerName);
  };

  const getTeamCards = (teamName: string) => {
    return cards.filter(card => card.team === teamName);
  };

  return {
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    addCard,
    checkForSecondYellow,
    resetCards,
    getPlayerCards,
    getTeamCards
  };
};
