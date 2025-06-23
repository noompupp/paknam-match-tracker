
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';

// Core slice for basic match state management methods
export interface CoreSlice extends Pick<
  MatchActions,
  | 'setFixtureId'
  | 'setHomeTeamName'
  | 'setAwayTeamName'
  | 'setHomeScore'
  | 'setAwayScore'
  | 'setMatchTime'
  | 'setIsRunning'
  | 'resetMatch'
  | 'setPhase'
  | 'setLastUpdated'
  | 'setHasUnsavedChanges'
> {}

export const createCoreSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  CoreSlice
> = (set, get) => ({
  setFixtureId: (fixtureId: number | null) => {
    set({ fixtureId, lastUpdated: Date.now() });
  },

  setHomeTeamName: (homeTeamName: string) => {
    set({ homeTeamName, lastUpdated: Date.now() });
  },

  setAwayTeamName: (awayTeamName: string) => {
    set({ awayTeamName, lastUpdated: Date.now() });
  },

  setHomeScore: (homeScore: number) => {
    set({ homeScore, hasUnsavedChanges: true, lastUpdated: Date.now() });
  },

  setAwayScore: (awayScore: number) => {
    set({ awayScore, hasUnsavedChanges: true, lastUpdated: Date.now() });
  },

  setMatchTime: (matchTime: number) => {
    set({ matchTime, lastUpdated: Date.now() });
  },

  setIsRunning: (isRunning: boolean) => {
    set({ isRunning, lastUpdated: Date.now() });
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
      homeTeamName: '',
      awayTeamName: '',
      homeTeamId: '',
      awayTeamId: '',
      matchTime: 0,
      isRunning: false,
      phase: 'scheduled',
      lastUpdated: Date.now()
    });
  },

  setPhase: (phase: string) => {
    set({ phase, lastUpdated: Date.now() });
  },

  setLastUpdated: (lastUpdated: number) => {
    set({ lastUpdated });
  },

  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => {
    set({ hasUnsavedChanges, lastUpdated: Date.now() });
  }
});
