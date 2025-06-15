
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';
import { assignGoalToPlayer } from '@/services/fixtures/simplifiedGoalAssignmentService';

export interface EnhancedGoalSlice {
  addGoal: MatchActions['addGoal'];
  removeGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<any>) => void;
  getUnsavedGoalsCount: MatchActions['getUnsavedGoalsCount'];
  syncGoalsToDatabase: (fixtureId: number) => Promise<void>;
  undoGoal: (goalId: string) => void; // Add to interface
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
      synced: false,
      isOwnGoal: goalData.isOwnGoal || false // Handle own goal flag with standardized naming
    };

    set((state) => ({
      goals: [...state.goals, newGoal],
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));

    console.log('⚽ Enhanced Goal Store: Goal added with standardized own goal support:', newGoal, '(synced:', newGoal.synced, ')');
    return newGoal;
  },

  removeGoal: (goalId: string) => {
    set((state) => ({
      goals: state.goals.filter(g => g.id !== goalId),
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));
    console.log('🗑️ Enhanced Goal Store: Goal removed:', goalId);
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
    console.log('✏️ Enhanced Goal Store: Goal updated:', goalId, updates);
  },

  getUnsavedGoalsCount: () => {
    const count = get().goals.filter(g => !g.synced).length;
    console.log('[ENHANCED GOAL SLICE] getUnsavedGoalsCount:', count, '(goals:', get().goals.map(g => ({ id: g.id, synced: g.synced })) ,')');
    return count;
  },

  syncGoalsToDatabase: async (fixtureId: number) => {
    const state = get();
    const unsyncedGoals = state.goals.filter(g => !g.synced);

    if (unsyncedGoals.length === 0) {
      console.log('✅ No unsynced goals to save');
      return;
    }

    try {
      console.log('💾 Syncing', unsyncedGoals.length, 'goal records to database with standardized own goal support');
      
      for (const goal of unsyncedGoals) {
        await assignGoalToPlayer({
          fixtureId,
          playerId: goal.playerId || 0,
          playerName: goal.playerName,
          teamId: goal.teamId.toString(),
          eventTime: goal.time,
          type: goal.type,
          isOwnGoal: goal.isOwnGoal || false // Pass standardized own goal flag
        });
      }

      // Mark all goals as synced
      set((state) => ({
        goals: state.goals.map(g => ({ ...g, synced: true })),
        hasUnsavedChanges: state.cards.some(c => !c.synced) || state.playerTimes.some(pt => !pt.synced),
        lastUpdated: Date.now()
      }));

      console.log('✅ Goal sync completed successfully with standardized own goal support. Updated goals:', get().goals);
    } catch (error) {
      console.error('❌ Error syncing goals to database:', error);
      throw error;
    }
  },

  // Added: new undoGoal implementation (simply removes the latest goal by id for now)
  undoGoal: (goalId: string) => {
    set((state) => {
      const updatedGoals = state.goals.filter(g => g.id !== goalId);
      console.log('[ENHANCED GOAL SLICE] undoGoal:', goalId, 'remaining:', updatedGoals.map(g => g.id));
      return {
        goals: updatedGoals,
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });
  },
});
