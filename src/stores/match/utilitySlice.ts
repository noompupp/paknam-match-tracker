
import { StateCreator } from 'zustand';
import { MatchState, MatchGoal, MatchCard, MatchPlayerTime } from './types';
import { MatchActions } from './actions';

// Utility/Database/Events/Reset & Batch slice for methods not covered by business slices
export interface UtilitySlice extends Pick<
  MatchActions,
  | 'loadPlayerTimesFromDatabase'
  | 'syncPlayerTimesToDatabase'
  | 'syncGoalsToDatabase'
  | 'syncCardsToDatabase'
  | 'clearPlayerTimes'
  | 'addEvent'
  | 'triggerUIUpdate'
  | 'resetState'
  | 'flushBatchedEvents'
> {}

// Dummy implementations (replace logic as needed)
export const createUtilitySlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  UtilitySlice
> = (set, get) => ({
  // Simulate async database loads/syncs -- just resolve immediately for now
  loadPlayerTimesFromDatabase: async (fixtureId: number) => {
    console.log('🗄️ loadPlayerTimesFromDatabase called (stub)', fixtureId);
    return;
  },
  syncPlayerTimesToDatabase: async (fixtureId: number) => {
    console.log('🗄️ syncPlayerTimesToDatabase called (stub)', fixtureId);
    return;
  },
  syncGoalsToDatabase: async (fixtureId: number) => {
    console.log('🗄️ syncGoalsToDatabase called (stub)', fixtureId);
    return;
  },
  syncCardsToDatabase: async (fixtureId: number) => {
    console.log('🗄️ syncCardsToDatabase called (stub)', fixtureId);
    return;
  },
  // Utility actions
  clearPlayerTimes: () => {
    set((state) => ({
      ...state,
      playerTimes: []
    }));
    console.log('Player times cleared');
  },
  addEvent: (type: string, description: string, time: number) => {
    set((state) => ({
      ...state,
      events: [
        ...state.events,
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          description,
          time,
          timestamp: Date.now(),
        }
      ],
      hasUnsavedChanges: true,
      lastUpdated: Date.now(),
    }));
    console.log('Event added', { type, description, time });
  },
  triggerUIUpdate: () => {
    set((state) => ({ ...state, lastUpdated: Date.now() }));
    console.log('Forced UI update');
  },
  resetState: () => {
    set((state) => ({
      fixtureId: null,
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      events: [],
      hasUnsavedChanges: false,
      lastUpdated: Date.now(),
    }));
    console.log('State fully reset');
  },
  flushBatchedEvents: async () => {
    console.log('flushBatchedEvents called (stub)');
    return;
  }
});
