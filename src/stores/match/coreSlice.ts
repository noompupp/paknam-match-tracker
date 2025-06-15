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
      homeTeamId: homeTeamId || state.homeTeamId || "",
      awayTeamId: awayTeamId || state.awayTeamId || ""
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
    set((state: MatchState) => {
      const goalsBefore = state.goals.filter(g => !g.synced).length;
      const cardsBefore = state.cards.filter(c => !c.synced).length;
      const timesBefore = state.playerTimes.filter(t => !t.synced).length;

      const updatedGoals = state.goals.map(goal => ({ ...goal, synced: true }));
      const updatedCards = state.cards.map(card => ({ ...card, synced: true }));
      const updatedPlayerTimes = state.playerTimes.map(time => ({ ...time, synced: true }));

      console.log(
        "[markAsSaved] Marked as saved:",
        {
          unsavedGoals: goalsBefore,
          unsavedCards: cardsBefore,
          unsavedPlayerTimes: timesBefore
        }
      );
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
    set((state: MatchState) => ({
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      hasUnsavedChanges: false,
      lastUpdated: Date.now()
    }));
    console.log("[MATCH RESET] State reset for fixture");
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
