
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface EnhancedCardSlice {
  addCard: MatchActions['addCard'];
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<any>) => void;
  getUnsavedCardsCount: MatchActions['getUnsavedCardsCount'];
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

    console.log('🟨 Enhanced Card Store: Card added with save capability:', newCard);
    return newCard;
  },

  removeCard: (cardId: string) => {
    set((state) => ({
      cards: state.cards.filter(c => c.id !== cardId),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
    console.log('🗑️ Enhanced Card Store: Card removed:', cardId);
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

  getUnsavedCardsCount: () => {
    return get().cards.filter(c => !c.synced).length;
  }
});
