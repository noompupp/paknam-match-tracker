
import { useCallback } from 'react';
import type { LocalCard, LocalMatchState } from './types';

export const useCardActions = (
  setLocalState: React.Dispatch<React.SetStateAction<LocalMatchState>>,
  generateId: () => string
) => {
  const addLocalCard = useCallback((cardData: Omit<LocalCard, 'id' | 'timestamp' | 'synced'>) => {
    const newCard: LocalCard = {
      ...cardData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false
    };

    setLocalState(prev => ({
      ...prev,
      cards: [...prev.cards, newCard],
      hasUnsavedChanges: true
    }));

    console.log('🟨 useLocalMatchState: Added local card:', newCard);
    return newCard;
  }, [generateId, setLocalState]);

  return {
    addLocalCard
  };
};
