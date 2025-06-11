
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';

export interface EnhancedGoalSlice {
  addGoal: MatchActions['addGoal'];
  addAssist: MatchActions['addAssist'];
  removeGoal: (goalId: string) => void;
  undoGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<any>) => void;
  getUnsavedGoalsCount: MatchActions['getUnsavedGoalsCount'];
  getUnassignedGoalsCount: MatchActions['getUnassignedGoalsCount'];
  getUnassignedGoals: MatchActions['getUnassignedGoals'];
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

  addAssist: (assistData) => {
    const newAssist = {
      ...assistData,
      type: 'assist' as const,
      id: generateId(),
      timestamp: Date.now(),
      synced: false
    };

    set((state) => ({
      goals: [...state.goals, newAssist],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
      // NOTE: No score increment for assists
    }));

    console.log('🅰️ Enhanced Goal Store: Assist added:', newAssist);
    return newAssist;
  },

  removeGoal: (goalId: string) => {
    set((state) => {
      const goalToRemove = state.goals.find(g => g.id === goalId);
      if (!goalToRemove) return state;

      const newHomeScore = goalToRemove.team === 'home' && goalToRemove.type === 'goal' ? Math.max(0, state.homeScore - 1) : state.homeScore;
      const newAwayScore = goalToRemove.team === 'away' && goalToRemove.type === 'goal' ? Math.max(0, state.awayScore - 1) : state.awayScore;

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

      const newHomeScore = goalToUndo.team === 'home' && goalToUndo.type === 'goal' ? Math.max(0, state.homeScore - 1) : state.homeScore;
      const newAwayScore = goalToUndo.team === 'away' && goalToUndo.type === 'goal' ? Math.max(0, state.awayScore - 1) : state.awayScore;

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
  },

  getUnassignedGoalsCount: () => {
    const unassignedCount = get().goals.filter(g => 
      g.playerName === 'Quick Goal' || 
      g.playerName === 'Unknown Player' ||
      (!g.playerId && g.type === 'goal')
    ).length;
    
    console.log('🏪 Enhanced Goal Store: Real-time unassigned goals count:', unassignedCount);
    return unassignedCount;
  },

  getUnassignedGoals: () => {
    const unassignedGoals = get().goals.filter(g => 
      g.playerName === 'Quick Goal' || 
      g.playerName === 'Unknown Player' ||
      (!g.playerId && g.type === 'goal')
    );
    
    console.log('🏪 Enhanced Goal Store: Real-time unassigned goals:', unassignedGoals);
    return unassignedGoals;
  }
});
