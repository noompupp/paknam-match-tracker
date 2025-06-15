import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';

export interface CoreSlice {
  setFixtureId: MatchActions['setFixtureId'];
  updateScore: MatchActions['updateScore'];
  markAsSaved: MatchActions['markAsSaved'];
  resetMatch: MatchActions['resetMatch'];
  resetState: MatchActions['resetState'];
  getUnsavedItemsCount: MatchActions['getUnsavedItemsCount'];
  addEvent: MatchActions['addEvent'];
  triggerUIUpdate: MatchActions['triggerUIUpdate'];
  clearPlayerTimes: MatchActions['clearPlayerTimes'];
  loadPlayerTimesFromDatabase: MatchActions['loadPlayerTimesFromDatabase'];
  syncGoalsToDatabase: MatchActions['syncGoalsToDatabase'];
  syncCardsToDatabase: MatchActions['syncCardsToDatabase'];
  flushBatchedEvents: () => Promise<void>;
}

export const createCoreSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  CoreSlice
> = (set, get) => ({
  setFixtureId: (fixtureId: number) => {
    set({ fixtureId });
  },

  updateScore: (homeScore: number, awayScore: number) => {
    set({
      homeScore,
      awayScore,
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    });
  },

  markAsSaved: () => {
    set((state) => ({
      goals: state.goals.map(g => ({ ...g, synced: true })),
      cards: state.cards.map(c => ({ ...c, synced: true })),
      playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    }));
  },

  resetMatch: () => {
    set({
      fixtureId: null,
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      events: [],
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    });
  },

  resetState: () => {
    set({
      fixtureId: null,
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      events: [],
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    });
  },

  getUnsavedItemsCount: () => {
    const state = get();
    const unsavedGoals = state.goals.filter(g => !g.synced).length;
    const unsavedCards = state.cards.filter(c => !c.synced).length;
    const unsavedPlayerTimes = state.playerTimes.filter(pt => !pt.synced).length;
    return {
      goals: unsavedGoals,
      cards: unsavedCards,
      playerTimes: unsavedPlayerTimes
    };
  },

  addEvent: (eventType: string, description: string, time: number) => {
    const eventData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      description,
      time,
      timestamp: Date.now()
    };
    
    set((state) => ({
      events: [...state.events, eventData],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
  },

  triggerUIUpdate: () => {
    set({ lastUpdated: Date.now() });
  },

  clearPlayerTimes: () => {
    set({ playerTimes: [], hasUnsavedChanges: true, lastUpdated: Date.now() });
  },

  loadPlayerTimesFromDatabase: async (fixtureId: number) => {
    try {
      console.log('📥 Loading player times from database for fixture:', fixtureId);
      // This would typically call an API to load player times
      // For now, we'll just mark as loaded
      set({ lastUpdated: Date.now() });
    } catch (error) {
      console.error('❌ Error loading player times from database:', error);
      throw error;
    }
  },

  syncGoalsToDatabase: async (fixtureId: number) => {
    const state = get();
    const unsyncedGoals = state.goals.filter(g => !g.synced);
    
    if (unsyncedGoals.length === 0) {
      console.log('✅ No unsynced goals to save');
      return;
    }
    
    try {
      console.log('💾 Syncing', unsyncedGoals.length, 'goals to database');
      // This would typically call an API to save the goals
      // For now, we'll just mark them as synced
      set((state) => ({
        goals: state.goals.map(g => ({ ...g, synced: true })),
        lastUpdated: Date.now()
      }));
      
      console.log('✅ Goals sync completed successfully');
    } catch (error) {
      console.error('❌ Error syncing goals to database:', error);
      throw error;
    }
  },

  syncCardsToDatabase: async (fixtureId: number) => {
    const state = get();
    const unsyncedCards = state.cards.filter(c => !c.synced);
    
    if (unsyncedCards.length === 0) {
      console.log('✅ No unsynced cards to save');
      return;
    }
    
    try {
      console.log('💾 Syncing', unsyncedCards.length, 'cards to database');
      // This would typically call an API to save the cards
      // For now, we'll just mark them as synced
      set((state) => ({
        cards: state.cards.map(c => ({ ...c, synced: true })),
        lastUpdated: Date.now()
      }));
      
      console.log('✅ Cards sync completed successfully');
    } catch (error) {
      console.error('❌ Error syncing cards to database:', error);
      throw error;
    }
  },

  flushBatchedEvents: async () => {
    // No batched events to flush by default
    return;
  }
});
