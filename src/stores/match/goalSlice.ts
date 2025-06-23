
import { StateCreator } from 'zustand';
import { MatchState, MatchGoal } from './types';
import { MatchActions } from './actions';

export interface GoalSlice {
  addAssist: MatchActions['addAssist'];
  undoGoal: MatchActions['undoGoal'];
  getUnassignedGoalsCount: MatchActions['getUnassignedGoalsCount'];
  getUnassignedGoals: MatchActions['getUnassignedGoals'];
}

export const createGoalSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  GoalSlice
> = (set, get) => ({
  addAssist: (assistData) => {
    const newAssist = {
      ...assistData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false,
      type: 'assist' as const
    };
    
    set((state) => ({
      goals: [...state.goals, newAssist],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
    
    return newAssist;
  },

  undoGoal: (goalId: string) => {
    set((state) => ({
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
  }
});
