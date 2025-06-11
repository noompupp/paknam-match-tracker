
import { useState, useCallback } from 'react';

interface LocalCard {
  id: number | string;
  player: string;
  playerId: number;
  team: string;
  teamId: string;
  type: 'yellow' | 'red';
  cardType: 'yellow' | 'red';
  time: number;
  timestamp: string;
  synced: boolean;
}

export const useLocalCardState = (initialCards: any[] = []) => {
  const [cards, setCards] = useState<LocalCard[]>(
    initialCards.map(card => ({
      id: card.id || Date.now(),
      player: card.player || card.playerName || '',
      playerId: card.playerId || 0,
      team: card.team || '',
      teamId: card.teamId || '',
      type: card.type || card.cardType || 'yellow',
      cardType: card.cardType || card.type || 'yellow',
      time: card.time || card.eventTime || 0,
      timestamp: card.timestamp || new Date().toISOString(),
      synced: card.synced || false
    }))
  );

  const addCard = useCallback((cardData: Omit<LocalCard, 'id' | 'timestamp' | 'synced'>) => {
    const newCard: LocalCard = {
      ...cardData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      synced: true // Mark as synced since it comes from database save
    };

    setCards(prev => [...prev, newCard]);
    console.log('🟨 useLocalCardState: Card added to local state:', newCard);
    
    return newCard;
  }, []);

  const removeCard = useCallback((cardId: number | string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    console.log('🗑️ useLocalCardState: Card removed from local state:', cardId);
  }, []);

  const clearCards = useCallback(() => {
    setCards([]);
    console.log('🧹 useLocalCardState: All cards cleared from local state');
  }, []);

  const getCardsByPlayer = useCallback((playerName: string) => {
    return cards.filter(card => card.player === playerName);
  }, [cards]);

  const getCardsByTeam = useCallback((team: string) => {
    return cards.filter(card => card.team === team);
  }, [cards]);

  const getUnsyncedCards = useCallback(() => {
    return cards.filter(card => !card.synced);
  }, [cards]);

  return {
    cards,
    addCard,
    removeCard,
    clearCards,
    getCardsByPlayer,
    getCardsByTeam,
    getUnsyncedCards,
    cardCount: cards.length
  };
};
