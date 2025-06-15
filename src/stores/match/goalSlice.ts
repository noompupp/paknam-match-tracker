import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';
import { findDuplicateGoal } from "@/utils/findDuplicateGoal";

export interface GoalSlice {
  addGoal: MatchActions['addGoal'];
  addAssist: MatchActions['addAssist'];
  updateGoal: MatchActions['updateGoal'];
  removeGoal: MatchActions['removeGoal'];
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
  addGoal: (goalData) => {
    const state = get();

    // Prevent duplicates
    const existing = findDuplicateGoal(
      state.goals as any,
      {
        playerId: goalData.playerId,
        time: goalData.time,
        teamId: goalData.teamId,
        type: goalData.type,
        isOwnGoal: goalData.isOwnGoal,
      }
    );
    if (existing) {
      console.warn("[DEDUP] Attempting to add duplicate goal:", goalData, existing);
      return null; // Don't add duplicate
    }

    const newGoal = {
      ...goalData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false
    };

    set((state) => {
      // Only increment score for actual goals, not assists
      const newHomeScore = goalData.teamName && goalData.type === 'goal' ?
        (goalData.teamName === state.homeTeamName ? state.homeScore + 1 : state.homeScore) :
        state.homeScore;
      const newAwayScore = goalData.teamName && goalData.type === 'goal' ?
        (goalData.teamName === state.awayTeamName ? state.awayScore + 1 : state.awayScore) :
        state.awayScore;

      const updatedState = {
        goals: [...state.goals, newGoal],
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        hasUnsavedChanges: true, // mark unsaved changes on goal add
        lastUpdated: Date.now()
      };

      console.log('🏪 MatchStore: Goal added with UI update trigger:', {
        goal: newGoal,
        newScore: `${newHomeScore}-${newAwayScore}`,
        totalGoals: updatedState.goals.length,
        lastUpdated: updatedState.lastUpdated
      });

      return updatedState;
    });

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

    set((state) => {
      const updatedState = {
        goals: [...state.goals, newAssist],
        hasUnsavedChanges: true, // mark unsaved changes on assist add
        lastUpdated: Date.now()
        // NOTE: No score increment for assists
      };

      console.log('🏪 MatchStore: Assist added with UI update trigger:', {
        assist: newAssist,
        totalGoalsAndAssists: updatedState.goals.length,
        lastUpdated: updatedState.lastUpdated
      });

      return updatedState;
    });

    return newAssist;
  },

  updateGoal: (goalId, updates) => {
    set((state) => {
      const updatedGoals = state.goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates, synced: updates.synced !== undefined ? updates.synced : false }
          : goal
      );

      const updatedState = {
        goals: updatedGoals,
        hasUnsavedChanges: true, // mark unsaved changes on update
        lastUpdated: Date.now()
      };

      console.log('🏪 MatchStore: Goal updated with UI update trigger:', {
        goalId,
        updates,
        updatedGoal: updatedGoals.find(g => g.id === goalId),
        lastUpdated: updatedState.lastUpdated
      });

      return updatedState;
    });
  },

  removeGoal: (goalId) => {
    set((state) => {
      const goalToRemove = state.goals.find(g => g.id === goalId);
      if (!goalToRemove) return state;

      // Only decrement score if it's an actual goal, not an assist
      const newHomeScore = goalToRemove.teamName && goalToRemove.type === 'goal' ?
        (goalToRemove.teamName === state.homeTeamName ? state.homeScore - 1 : state.homeScore) :
        state.homeScore;
      const newAwayScore = goalToRemove.teamName && goalToRemove.type === 'goal' ?
        (goalToRemove.teamName === state.awayTeamName ? state.awayScore - 1 : state.awayScore) :
        state.awayScore;

      return {
        goals: state.goals.filter(g => g.id !== goalId),
        homeScore: Math.max(0, newHomeScore),
        awayScore: Math.max(0, newAwayScore),
        hasUnsavedChanges: true, // mark unsaved changes on remove
        lastUpdated: Date.now()
      };
    });
  },

  undoGoal: (goalId) => {
    // For now, undoGoal is the same as removeGoal
    // This could be enhanced later to have different behavior (e.g., soft delete vs hard delete)
    set((state) => {
      const goalToUndo = state.goals.find(g => g.id === goalId);
      if (!goalToUndo) return state;

      // Only decrement score if it's an actual goal, not an assist
      const newHomeScore = goalToUndo.teamName && goalToUndo.type === 'goal' ?
        (goalToUndo.teamName === state.homeTeamName ? state.homeScore - 1 : state.homeScore) :
        state.homeScore;
      const newAwayScore = goalToUndo.teamName && goalToUndo.type === 'goal' ?
        (goalToUndo.teamName === state.awayTeamName ? state.awayScore - 1 : state.awayScore) :
        state.awayScore;

      console.log('🔄 MatchStore: Goal undone:', {
        goalId,
        goalToUndo,
        newScore: `${Math.max(0, newHomeScore)}-${Math.max(0, newAwayScore)}`
      });

      return {
        goals: state.goals.filter(g => g.id !== goalId),
        homeScore: Math.max(0, newHomeScore),
        awayScore: Math.max(0, newAwayScore),
        hasUnsavedChanges: true, // mark unsaved changes on undo
        lastUpdated: Date.now()
      };
    });
  },

  getUnassignedGoalsCount: () => {
    const unassignedCount = get().goals.filter(g => 
      g.playerName === 'Quick Goal' || 
      g.playerName === 'Unknown Player' ||
      (!g.playerId && g.type === 'goal')
    ).length;
    
    console.log('🏪 MatchStore: Real-time unassigned goals count:', unassignedCount);
    return unassignedCount;
  },

  getUnassignedGoals: () => {
    const unassignedGoals = get().goals.filter(g => 
      g.playerName === 'Quick Goal' || 
      g.playerName === 'Unknown Player' ||
      (!g.playerId && g.type === 'goal')
    );
    
    console.log('🏪 MatchStore: Real-time unassigned goals:', unassignedGoals);
    return unassignedGoals;
  }
});
