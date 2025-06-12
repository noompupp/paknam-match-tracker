
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';

export interface CoreSlice {
  setFixtureId: MatchActions['setFixtureId'];
  updateScore: MatchActions['updateScore'];
  markAsSaved: MatchActions['markAsSaved'];
  resetMatch: MatchActions['resetMatch'];
  getUnsavedItemsCount: MatchActions['getUnsavedItemsCount'];
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

  getUnsavedItemsCount: () => {
    const state = get();
    const unsavedGoals = state.goals.filter(g => !g.synced).length;
    const unsavedCards = state.cards.filter(c => !c.synced).length;
    const unsavedPlayerTimes = state.playerTimes.filter(pt => !pt.synced).length;
    return unsavedGoals + unsavedCards + unsavedPlayerTimes;
  }
});
