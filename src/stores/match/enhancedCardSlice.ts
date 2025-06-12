
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface EnhancedCardSlice {
  addCard: MatchActions['addCard'];
  updateCard: (cardId: string, updates: Partial<any>) => void;
  removeCard: (cardId: string) => void;
  getUnsavedCardsCount: () => number;
}

export const createEnhancedCardSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  EnhancedCardSlice
> = (set, get) => ({
  addCard: (cardData) => {
    const newCard = {
      ...cardData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false
    };

    set((state) => ({
      cards: [...state.cards, newCard],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));

    console.log('🟨 Enhanced Card Store: Card added:', newCard);
    return newCard;
  },

  updateCard: (cardId: string, updates: Partial<any>) => {
    set((state) => ({
      cards: state.cards.map(card => 
        card.id === cardId 
          ? { ...card, ...updates, synced: false }
          : card
      ),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
  },

  removeCard: (cardId: string) => {
    set((state) => ({
      cards: state.cards.filter(c => c.id !== cardId),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
    console.log('🗑️ Enhanced Card Store: Card removed:', cardId);
  },

  getUnsavedCardsCount: () => {
    return get().cards.filter(c => !c.synced).length;
  }
});
