
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId, createInitialState } from './utils';

export interface CoreSlice {
  setFixtureId: MatchActions['setFixtureId'];
  addEvent: MatchActions['addEvent'];
  markAsSaved: MatchActions['markAsSaved'];
  resetState: MatchActions['resetState'];
  triggerUIUpdate: MatchActions['triggerUIUpdate'];
  getUnsavedGoalsCount: MatchActions['getUnsavedGoalsCount'];
  getUnsavedItemsCount: MatchActions['getUnsavedItemsCount'];
}

export const createCoreSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  CoreSlice
> = (set, get) => ({
  setFixtureId: (id) => {
    const state = get();
    if (state.fixtureId !== id) {
      // Reset state when changing fixtures
      set({
        ...createInitialState(),
        fixtureId: id
      });
      console.log('🏪 MatchStore: Fixture changed, state reset for fixture:', id);
    }
  },

  addEvent: (type, description, time) => {
    const newEvent = {
      id: generateId(),
      type,
      description,
      time,
      timestamp: Date.now()
    };

    set((state) => ({
      events: [...state.events, newEvent],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));

    return newEvent;
  },

  markAsSaved: () => {
    set((state) => ({
      goals: state.goals.map(g => ({ ...g, synced: true })),
      cards: state.cards.map(c => ({ ...c, synced: true })),
      playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
      lastSaved: Date.now(),
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    }));
    console.log('🏪 MatchStore: All data marked as saved with UI update trigger');
  },

  resetState: () => {
    set(createInitialState());
    console.log('🏪 MatchStore: State reset with UI update trigger');
  },

  triggerUIUpdate: () => {
    set((state) => ({
      lastUpdated: Date.now()
    }));
    console.log('🏪 MatchStore: Manual UI update triggered');
  },

  getUnsavedGoalsCount: () => {
    return get().goals.filter(g => !g.synced).length;
  },

  getUnsavedItemsCount: () => {
    const state = get();
    return {
      goals: state.goals.filter(g => !g.synced).length,
      cards: state.cards.filter(c => !c.synced).length,
      playerTimes: state.playerTimes.filter(pt => !pt.synced).length
    };
  }
});
