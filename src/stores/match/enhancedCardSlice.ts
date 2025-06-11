
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';
import { assignCardToPlayer } from '@/services/fixtures/simplifiedCardService';

export interface EnhancedCardSlice {
  addCard: MatchActions['addCard'];
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<any>) => void;
  getUnsavedCardsCount: MatchActions['getUnsavedCardsCount'];
  syncCardsToDatabase: (fixtureId: number) => Promise<void>;
  batchSyncCards: (fixtureId: number) => Promise<void>;
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

    console.log('🟨 Enhanced Card Store: Card added with improved save capability:', newCard);
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
  },

  syncCardsToDatabase: async (fixtureId: number) => {
    const state = get();
    const unsyncedCards = state.cards.filter(c => !c.synced);
    
    if (unsyncedCards.length === 0) {
      console.log('✅ No unsynced cards to save');
      return;
    }

    try {
      console.log('💾 Enhanced Card Sync: Processing', unsyncedCards.length, 'card records');
      
      for (const card of unsyncedCards) {
        await assignCardToPlayer({
          fixtureId,
          playerId: card.playerId || 0,
          playerName: card.playerName,
          teamId: card.teamId.toString(),
          cardType: card.type,
          eventTime: card.time
        });
      }

      // Mark all cards as synced
      set((state) => ({
        cards: state.cards.map(c => ({ ...c, synced: true })),
        hasUnsavedChanges: state.goals.some(g => !g.synced) || state.playerTimes.some(pt => !pt.synced),
        lastUpdated: Date.now()
      }));

      console.log('✅ Enhanced Card Sync: Completed successfully');
    } catch (error) {
      console.error('❌ Enhanced Card Sync: Error syncing cards to database:', error);
      throw error;
    }
  },

  batchSyncCards: async (fixtureId: number) => {
    console.log('🔄 Enhanced Card Sync: Starting batch sync for fixture:', fixtureId);
    try {
      await get().syncCardsToDatabase(fixtureId);
      console.log('✅ Enhanced Card Sync: Batch sync completed successfully');
    } catch (error) {
      console.error('❌ Enhanced Card Sync: Batch sync failed:', error);
      throw error;
    }
  }
});
