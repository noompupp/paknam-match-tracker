
import { StateCreator } from 'zustand';
import { MatchState } from './types';
import { MatchActions } from './actions';
import { generateId } from './utils';
import { assignGoalToPlayer } from '@/services/fixtures/simplifiedGoalAssignmentService';
import { normalizeTeamName } from './teamStringUtils';

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
    const state = get();
    const { homeTeamName, awayTeamName, homeScore, awayScore } = state;

    // Use normalization for all team name matching
    const inputTeamName = normalizeTeamName(goalData.teamName);
    const homeNameNorm = normalizeTeamName(homeTeamName);
    const awayNameNorm = normalizeTeamName(awayTeamName);

    // Debug logs for deeper trace
    console.log('[ENH GOAL][addGoal] INPUT:', {
      goalData,
      inputTeamName,
      homeTeamName,
      homeNameNorm,
      awayTeamName,
      awayNameNorm,
      homeScore,
      awayScore
    });

    // Determine if this is an actual goal (not assist)
    const isGoal = goalData.type === "goal";
    let newHomeScore = homeScore;
    let newAwayScore = awayScore;

    // Only increment score for actual goals (not assists), using normalized teamName for match
    if (isGoal) {
      if (inputTeamName === homeNameNorm) {
        newHomeScore = homeScore + 1;
        console.log('[ENH GOAL][addGoal] Home goal detected', { newHomeScore });
      } else if (inputTeamName === awayNameNorm) {
        newAwayScore = awayScore + 1;
        console.log('[ENH GOAL][addGoal] Away goal detected', { newAwayScore });
      } else {
        console.warn('[ENH GOAL][addGoal] Goal TeamName did not match either home or away after normalization', {
          inputTeamName, homeNameNorm, awayNameNorm
        });
      }
    }

    const newGoal = {
      ...goalData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false,
      isOwnGoal: goalData.isOwnGoal || false // Handle own goal flag with standardized naming
    };

    set((state) => ({
      goals: [...state.goals, newGoal],
      // Update scores if this is an actual goal
      homeScore: newHomeScore,
      awayScore: newAwayScore,
      hasUnsavedChanges: true,
      lastUpdated: Date.now()
    }));

    console.log('⚽ Enhanced Goal Store: Goal added (w/ score update) with standardized own goal support:', {
      newGoal,
      homeTeamName,
      awayTeamName,
      inputTeamName,
      newHomeScore,
      newAwayScore,
      goalCount: get().goals.length + 1, // +1 because we just added one, before Zustand state commit
      justAddedGoal: newGoal,
    });
    return newGoal;
  },

  removeGoal: (goalId: string) => {
    set((state) => {
      const goalToRemove = state.goals.find(g => g.id === goalId);
      if (!goalToRemove) return state;

      // Use normalization for matching
      const toRemoveNorm = normalizeTeamName(goalToRemove.teamName);
      const homeNameNorm = normalizeTeamName(state.homeTeamName);
      const awayNameNorm = normalizeTeamName(state.awayTeamName);

      let newHomeScore = state.homeScore;
      let newAwayScore = state.awayScore;
      if (goalToRemove.type === "goal") {
        if (toRemoveNorm === homeNameNorm) {
          newHomeScore = Math.max(0, state.homeScore - 1);
        } else if (toRemoveNorm === awayNameNorm) {
          newAwayScore = Math.max(0, state.awayScore - 1);
        }
      }

      console.log('[ENH GOAL][removeGoal] Removing goal:', {
        goalId,
        toRemoveNorm,
        homeNameNorm,
        awayNameNorm,
        newHomeScore,
        newAwayScore
      });

      return {
        goals: state.goals.filter(g => g.id !== goalId),
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });
    console.log('🗑️ Enhanced Goal Store: Goal removed (w/ score recalculation):', goalId);
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
