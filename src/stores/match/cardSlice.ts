
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface CardSlice {
  addCard: MatchActions['addCard'];
  getUnsavedCardsCount: MatchActions['getUnsavedCardsCount'];
}

export const createCardSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  CardSlice
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

    console.log('🏪 MatchStore: Card added:', newCard);
    return newCard;
  },

  getUnsavedCardsCount: () => {
    return get().cards.filter(c => !c.synced).length;
  }
});
