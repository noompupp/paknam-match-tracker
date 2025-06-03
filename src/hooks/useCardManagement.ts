
import { useState } from "react";

interface CardData {
  id: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  time: number;
}

export const useCardManagement = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("home");

  const addCard = (type: 'yellow' | 'red', teamName: string, matchTime: number) => {
    if (!playerName.trim()) return null;

    const newCard: CardData = {
      id: Date.now(),
      player: playerName,
      team: teamName,
      type,
      time: matchTime
    };

    setCards(prev => [...prev, newCard]);
    setPlayerName("");
    return newCard;
  };

  const resetCards = () => {
    setCards([]);
    setPlayerName("");
    setSelectedTeam("home");
  };

  return {
    cards,
    playerName,
    selectedTeam,
    setPlayerName,
    setSelectedTeam,
    addCard,
    resetCards
  };
};
