
import { useState } from "react";

interface Player {
  id: number;
  name: string;
  team: string;
  number?: string;
  position?: string;
}

interface CardData {
  id: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  time: number;
  reason?: string;
  playerNumber?: string;
}

export const useCardManagementDropdown = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("home");
  const [selectedCardType, setSelectedCardType] = useState<'yellow' | 'red'>('yellow');

  const addCard = (player: Player, teamName: string, matchTime: number, cardType: 'yellow' | 'red') => {
    if (!player) return null;

    // Check for double yellow card scenario
    const existingYellowCard = cards.find(
      card => card.player === player.name && card.team === teamName && card.type === 'yellow'
    );

    const newCard: CardData = {
      id: Date.now(),
      player: player.name,
      team: teamName,
      type: cardType,
      time: matchTime,
      playerNumber: player.number
    };

    setCards(prev => [...prev, newCard]);
    
    // Clear selection after adding card
    setSelectedPlayer("");
    
    // Return card info with warning if it's a second yellow
    return {
      ...newCard,
      isSecondYellow: cardType === 'yellow' && !!existingYellowCard
    };
  };

  const removeCard = (cardId: number) => {
    const card = cards.find(c => c.id === cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
    return card;
  };

  const getPlayerCards = (playerName: string, teamName: string) => {
    return cards.filter(card => card.player === playerName && card.team === teamName);
  };

  const getTeamCards = (teamName: string) => {
    return cards.filter(card => card.team === teamName);
  };

  const resetCards = () => {
    setCards([]);
    setSelectedPlayer("");
    setSelectedTeam("home");
    setSelectedCardType('yellow');
  };

  // Check if a player should be automatically red-carded (second yellow)
  const checkForSecondYellow = (playerName: string, teamName: string): boolean => {
    const playerCards = getPlayerCards(playerName, teamName);
    return playerCards.filter(card => card.type === 'yellow').length >= 2;
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
    removeCard,
    getPlayerCards,
    getTeamCards,
    resetCards,
    checkForSecondYellow
  };
};
