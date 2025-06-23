
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
  | 'getActivePlayersCount'
  | 'syncAllToDatabase'
  | 'addAssist'
  | 'undoGoal'
  | 'getUnassignedGoalsCount'
  | 'getUnassignedGoals'
  | 'markAsSaved'
  | 'getUnsavedItemsCount'
> {}

// Dummy implementations (replace logic as needed)
export const createUtilitySlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  UtilitySlice
> = (set, get) => ({
  // Database operations
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
  syncAllToDatabase: async (fixtureId: number) => {
    console.log('🗄️ syncAllToDatabase called (stub)', fixtureId);
    return;
  },
  
  // Player time utilities
  clearPlayerTimes: () => {
    set((state) => ({
      ...state,
      playerTimes: []
    }));
    console.log('Player times cleared');
  },
  getActivePlayersCount: () => {
    const state = get();
    return state.playerTimes.filter(pt => pt.isActive || pt.isPlaying).length;
  },
  
  // Goal utilities
  addAssist: (assistData) => {
    const state = get();
    const newAssist = {
      ...assistData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false,
      type: 'assist' as const
    };
    
    set((state) => ({
      ...state,
      goals: [...state.goals, newAssist],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
    
    return newAssist;
  },
  undoGoal: (goalId: string) => {
    set((state) => ({
      ...state,
      goals: state.goals.filter(g => g.id !== goalId),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
  },
  getUnassignedGoalsCount: () => {
    const state = get();
    return state.goals.filter(g => !g.playerId).length;
  },
  getUnassignedGoals: () => {
    const state = get();
    return state.goals.filter(g => !g.playerId);
  },
  
  // Event management
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
  
  // UI and state management
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
      homeTeamName: '',
      awayTeamName: '',
      homeTeamId: '',
      awayTeamId: '',
      matchTime: 0,
      isRunning: false,
      phase: 'scheduled'
    }));
    console.log('State fully reset');
  },
  markAsSaved: () => {
    set((state) => ({
      ...state,
      hasUnsavedChanges: false,
      goals: state.goals.map(g => ({ ...g, synced: true })),
      cards: state.cards.map(c => ({ ...c, synced: true })),
      playerTimes: state.playerTimes.map(pt => ({ ...pt, synced: true })),
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
  },
  
  // Batch operations
  flushBatchedEvents: async () => {
    console.log('flushBatchedEvents called (stub)');
    return;
  }
});
