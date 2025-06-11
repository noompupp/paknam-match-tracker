
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface EnhancedGoalSlice {
  addGoal: MatchActions['addGoal'];
  removeGoal: (goalId: string) => void;
  undoGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<any>) => void;
  getUnsavedGoalsCount: MatchActions['getUnsavedGoalsCount'];
}

export const createEnhancedGoalSlice: StateCreator<
  MatchState & MatchActions,
  [],
  [],
  EnhancedGoalSlice
> = (set, get) => ({
  addGoal: (goalData) => {
    const newGoal = {
      ...goalData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false
    };

    set((state) => {
      const newHomeScore = goalData.team === 'home' ? state.homeScore + 1 : state.homeScore;
      const newAwayScore = goalData.team === 'away' ? state.awayScore + 1 : state.awayScore;
      
      return {
        goals: [...state.goals, newGoal],
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });

    console.log('⚽ Enhanced Goal Store: Goal added:', newGoal);
    return newGoal;
  },

  removeGoal: (goalId: string) => {
    set((state) => {
      const goalToRemove = state.goals.find(g => g.id === goalId);
      if (!goalToRemove) return state;

      const newHomeScore = goalToRemove.team === 'home' ? Math.max(0, state.homeScore - 1) : state.homeScore;
      const newAwayScore = goalToRemove.team === 'away' ? Math.max(0, state.awayScore - 1) : state.awayScore;

      return {
        goals: state.goals.filter(g => g.id !== goalId),
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });
    console.log('🗑️ Enhanced Goal Store: Goal removed:', goalId);
  },

  undoGoal: (goalId: string) => {
    // For undo, we mark the goal as "undone" rather than removing it entirely
    set((state) => {
      const goalToUndo = state.goals.find(g => g.id === goalId);
      if (!goalToUndo || goalToUndo.synced) return state; // Can't undo synced goals

      const newHomeScore = goalToUndo.team === 'home' ? Math.max(0, state.homeScore - 1) : state.homeScore;
      const newAwayScore = goalToUndo.team === 'away' ? Math.max(0, state.awayScore - 1) : state.awayScore;

      return {
        goals: state.goals.filter(g => g.id !== goalId), // Remove unsaved goal
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });
    console.log('↩️ Enhanced Goal Store: Goal undone:', goalId);
  },

  updateGoal: (goalId: string, updates: Partial<any>) => {
    set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates, synced: false }
          : goal
      ),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
  },

  getUnsavedGoalsCount: () => {
    return get().goals.filter(g => !g.synced).length;
  }
});
