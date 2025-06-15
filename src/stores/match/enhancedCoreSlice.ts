
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { AutoSyncSlice } from './autoSyncSlice';
import { calculateMatchScore } from "@/utils/calculateMatchScore";

function recalculateScores(goals: any[], homeTeamName: string, awayTeamName: string, homeTeamId?: string, awayTeamId?: string) {
  const { homeScore, awayScore } = calculateMatchScore({
    goals,
    homeTeamId,
    awayTeamId,
    homeTeamName,
    awayTeamName
  });
  return { homeScore, awayScore };
}

export interface EnhancedCoreSlice {
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
  autoSyncScores: () => Promise<void>;
}

export const createEnhancedCoreSlice: StateCreator<
  MatchState & MatchActions & AutoSyncSlice,
  [],
  [],
  EnhancedCoreSlice
> = (set, get) => ({
  setupMatch: ({ fixtureId, homeTeamName, awayTeamName, homeTeamId, awayTeamId }) => {
    set((prevState) => {
      const next = {
        ...prevState,
        fixtureId,
        homeTeamName: homeTeamName || prevState.homeTeamName || "",
        awayTeamName: awayTeamName || prevState.awayTeamName || "",
        homeTeamId: homeTeamId || prevState.homeTeamId || "",
        awayTeamId: awayTeamId || prevState.awayTeamId || "",
      };

      const oldGoals = prevState.goals || [];
      const { homeScore, awayScore } = recalculateScores(
        oldGoals, 
        next.homeTeamName, 
        next.awayTeamName, 
        next.homeTeamId, 
        next.awayTeamId
      );

      return {
        ...next,
        homeScore,
        awayScore,
        hasUnsavedChanges: false,
        lastUpdated: Date.now()
      };
    });
  },

  setFixtureId: (fixtureId: number) => {
    set({ fixtureId, lastUpdated: Date.now() });
  },

  updateScore: (homeScore: number, awayScore: number) => {
    set({ homeScore, awayScore, lastUpdated: Date.now() });
    
    setTimeout(() => {
      const state = get();
      if (state.isAutoSyncEnabled && !state.isSyncing) {
        state.syncToDatabase();
      }
    }, 100);
  },

  markAsSaved: () => {
    set((state) => {
      const goalsBefore = state.goals.filter(g => !g.synced).length;
      const cardsBefore = state.cards.filter(c => !c.synced).length;
      const timesBefore = state.playerTimes.filter(t => !t.synced).length;

      const updatedGoals = state.goals.map(goal => ({ ...goal, synced: true }));
      const updatedCards = state.cards.map(card => ({ ...card, synced: true }));
      const updatedPlayerTimes = state.playerTimes.map(time => ({ ...time, synced: true }));

      return {
        ...state,
        goals: updatedGoals,
        cards: updatedCards,
        playerTimes: updatedPlayerTimes,
        hasUnsavedChanges: false,
        lastUpdated: Date.now()
      };
    });
  },

  resetMatch: () => {
    set({
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    });
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
  },

  autoSyncScores: async () => {
    const state = get();
    
    if (!state.isAutoSyncEnabled) {
      return;
    }

    try {
      await state.syncToDatabase();
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
    }
  }
});
