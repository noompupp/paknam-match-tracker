
import { useState } from "react";

interface CardData {
  id: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  time: number;
  reason?: string;
  playerNumber?: string;
}

export const useCardManagement = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("home");
  const [cardReason, setCardReason] = useState("");

  const addCard = (type: 'yellow' | 'red', teamName: string, matchTime: number, reason?: string) => {
    if (!playerName.trim()) return null;

    // Check for double yellow card scenario
    const existingYellowCard = cards.find(
      card => card.player === playerName && card.team === teamName && card.type === 'yellow'
    );

    const newCard: CardData = {
      id: Date.now(),
      player: playerName,
      team: teamName,
      type,
      time: matchTime,
      reason: reason || cardReason
    };

    setCards(prev => [...prev, newCard]);
    
    // Clear form after adding card
    setPlayerName("");
    setCardReason("");
    
    // Return card info with warning if it's a second yellow
    return {
      ...newCard,
      isSecondYellow: type === 'yellow' && !!existingYellowCard
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
    setPlayerName("");
    setSelectedTeam("home");
    setCardReason("");
  };

  // Check if a player should be automatically red-carded (second yellow)
  const checkForSecondYellow = (playerName: string, teamName: string): boolean => {
    const playerCards = getPlayerCards(playerName, teamName);
    return playerCards.filter(card => card.type === 'yellow').length >= 2;
  };

  return {
    cards,
    playerName,
    selectedTeam,
    cardReason,
    setPlayerName,
    setSelectedTeam,
    setCardReason,
    addCard,
    removeCard,
    getPlayerCards,
    getTeamCards,
    resetCards,
    checkForSecondYellow
  };
};
