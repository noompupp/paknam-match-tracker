
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';

export interface CoreSlice {
  setFixtureId: MatchActions['setFixtureId'];
  addEvent: MatchActions['addEvent'];
  markAsSaved: MatchActions['markAsSaved'];
  resetState: MatchActions['resetState'];
  triggerUIUpdate: MatchActions['triggerUIUpdate'];
  getUnsavedItemsCount: MatchActions['getUnsavedItemsCount'];
}

export const createCoreSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  CoreSlice
> = (set, get) => ({
  setFixtureId: (id) => {
    set({ fixtureId: id });
  },

  addEvent: (type, description, time) => {
    const newEvent = {
      id: `event_${Date.now()}`,
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

  triggerUIUpdate: () => {
    set((state) => ({
      lastUpdated: Date.now()
    }));
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
