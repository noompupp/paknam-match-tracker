import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';

export interface CoreSlice {
  setupMatch: (data: {
    fixtureId: number;
    homeTeamName: string;
    awayTeamName: string;
    homeTeamId?: string;
    awayTeamId?: string;
  }) => void;
  setFixtureId: (fixtureId: number) => void;
  updateScore: (homeScore: number, awayScore: number) => void;
  markAsSaved: () => void;
  resetMatch: () => void;
  getUnsavedItemsCount: () => { goals: number; cards: number; playerTimes: number };
}

// Add to your coreSlice
export const createCoreSlice = (set: any, get: any, api: any): CoreSlice => ({
  setupMatch: ({ fixtureId, homeTeamName, awayTeamName, homeTeamId, awayTeamId }) => {
    set((state: any) => ({
      fixtureId,
      homeTeamName,
      awayTeamName,
      homeTeamId: homeTeamId || state.homeTeamId,
      awayTeamId: awayTeamId || state.awayTeamId,
    }));
    console.log("[MATCH SETUP] Store initialized:", {
      fixtureId,
      homeTeamName,
      awayTeamName,
      homeTeamId,
      awayTeamId
    });
  },
  setFixtureId: (fixtureId: number) => {
    set({ fixtureId });
    console.log("[FIXTURE ID] Set fixtureId:", fixtureId);
  },
  updateScore: (homeScore: number, awayScore: number) => {
    set({ homeScore, awayScore });
  },
  markAsSaved: () => {
    set({ hasUnsavedChanges: false });
  },
  resetMatch: () => {
    set((state: MatchState) => ({
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    }));
  },
  getUnsavedItemsCount: () => {
    const state = get();
    const unsavedGoals = state.goals.filter(item => !item.synced).length;
    const unsavedCards = state.cards.filter(item => !item.synced).length;
    const unsavedPlayerTimes = state.playerTimes.filter(item => !item.synced).length;

    return {
      goals: unsavedGoals,
      cards: unsavedCards,
      playerTimes: unsavedPlayerTimes
    };
  }
});
