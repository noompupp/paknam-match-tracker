
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

    console.log('⚽ Enhanced Goal Store: Goal added with standardized own goal support:', newGoal);
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
  },

  getUnsavedGoalsCount: () => {
    return get().goals.filter(g => !g.synced).length;
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

      console.log('✅ Goal sync completed successfully with standardized own goal support');
    } catch (error) {
      console.error('❌ Error syncing goals to database:', error);
      throw error;
    }
  }
});
