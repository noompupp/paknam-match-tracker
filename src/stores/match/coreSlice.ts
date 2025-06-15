
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';

function recalculateScores(goals: any[], homeTeamName: string, awayTeamName: string) {
  let newHomeScore = 0;
  let newAwayScore = 0;
  for (const goal of goals) {
    if (goal.type === "goal") {
      if (goal.teamName?.trim() === homeTeamName?.trim()) newHomeScore++;
      else if (goal.teamName?.trim() === awayTeamName?.trim()) newAwayScore++;
    }
  }
  return { homeScore: newHomeScore, awayScore: newAwayScore };
}

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

// Improved: always spread previous state for defensive merging and validate correct persistence of team names/ids
export const createCoreSlice = (set: any, get: any, api: any): CoreSlice => ({
  setupMatch: ({ fixtureId, homeTeamName, awayTeamName, homeTeamId, awayTeamId }) => {
    set((prevState: any) => {
      // Defensive fallback
      const next = {
        ...prevState,
        fixtureId,
        homeTeamName: homeTeamName || prevState.homeTeamName || "",
        awayTeamName: awayTeamName || prevState.awayTeamName || "",
        homeTeamId: homeTeamId || prevState.homeTeamId || "",
        awayTeamId: awayTeamId || prevState.awayTeamId || "",
      };

      // Defensive: recalculate scores from goals based on new team names
      const { homeScore, awayScore } = recalculateScores(prevState.goals || [], next.homeTeamName, next.awayTeamName);

      // Logging for diagnosis
      console.log("[MATCH SETUP] setupMatch called with:", {
        fixtureId,
        homeTeamName,
        awayTeamName,
        homeTeamId,
        awayTeamId
      });
      console.log("[MATCH SETUP] Previous state before update:", prevState);

      // Defensive: warn if missing team names
      if (!next.homeTeamName || !next.awayTeamName)
        console.warn("[MATCH SETUP] Warning: Missing team names after setupMatch!", next);

      // Provide recomputed score and avoid undefined fields
      return {
        ...next,
        homeScore,
        awayScore,
        hasUnsavedChanges: false,
        lastUpdated: Date.now()  // <-- always updated
      };
    });

    // Log actual new state after tick
    setTimeout(() => {
      const s = get();
      console.log("[MATCH SETUP] 🏷️ Store state after setupMatch:", {
        fixtureId: s.fixtureId,
        homeTeamName: s.homeTeamName,
        awayTeamName: s.awayTeamName,
        homeTeamId: s.homeTeamId,
        awayTeamId: s.awayTeamId,
        homeScore: s.homeScore,
        awayScore: s.awayScore,
        goals: s.goals,
      });
    }, 0);
  },
  setFixtureId: (fixtureId: number) => {
    set({ fixtureId, lastUpdated: Date.now() });
    console.log("[FIXTURE ID] Set fixtureId:", fixtureId);
  },
  updateScore: (homeScore: number, awayScore: number) => {
    set({ homeScore, awayScore, lastUpdated: Date.now() });
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
