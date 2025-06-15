
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
  recalculateScores: () => void; // new: recalc scores from existing goals using team names
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

    // Debug log: print ALL relevant state before mutation
    console.log('🟡 [addGoal] Store State Before:', {
      homeTeamName,
      awayTeamName,
      homeScore,
      awayScore,
      goals: state.goals,
      incomingGoal: goalData,
    });

    // Determine if this is an actual goal (not assist)
    const isGoal = goalData.type === "goal";
    let newHomeScore = homeScore;
    let newAwayScore = awayScore;

    // Debug: compare incoming goalData teamName with state team names
    console.log('🔵 [addGoal] Comparing team names:', {
      incoming: goalData.teamName,
      match_homeTeamName: homeTeamName,
      match_awayTeamName: awayTeamName,
      isGoal,
      homeScore,
      awayScore,
    });

    // Only increment score for actual goals (not assists), using teamName for match
    if (isGoal) {
      if (goalData.teamName?.trim() === homeTeamName?.trim()) {
        newHomeScore = homeScore + 1;
      } else if (goalData.teamName?.trim() === awayTeamName?.trim()) {
        newAwayScore = awayScore + 1;
      }
      // Log result
      console.log('🟢 [addGoal] Score change:', {
        homeScore: homeScore, awayScore: awayScore,
        newHomeScore, newAwayScore,
        matchedHome: goalData.teamName?.trim() === homeTeamName?.trim(),
        matchedAway: goalData.teamName?.trim() === awayTeamName?.trim(),
      });
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

    // Debug log after mutation
    const afterState = get();
    console.log('🟢 [addGoal] Store State After:', {
      homeScore: afterState.homeScore,
      awayScore: afterState.awayScore,
      goals: afterState.goals,
      addedGoal: newGoal
    });
    return newGoal;
  },

  removeGoal: (goalId: string) => {
    const state = get();
    // Pre-log: which goal is about to be removed
    const goalToRemove = state.goals.find(g => g.id === goalId);
    console.log('🗑️ [removeGoal] Attempt to remove:', {
      goalId,
      goalToRemove,
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      homeTeamName: state.homeTeamName,
      awayTeamName: state.awayTeamName,
    });

    set((state) => {
      const goalToRemove = state.goals.find(g => g.id === goalId);
      if (!goalToRemove) {
        console.log('⚠️ [removeGoal] Goal not found:', goalId);
        return state;
      }

      // Only decrement score if this record is a goal (not assist), and is for the matching team name
      let newHomeScore = state.homeScore;
      let newAwayScore = state.awayScore;
      if (goalToRemove.type === "goal") {
        if (goalToRemove.teamName?.trim() === state.homeTeamName?.trim()) {
          newHomeScore = Math.max(0, state.homeScore - 1);
        } else if (goalToRemove.teamName?.trim() === state.awayTeamName?.trim()) {
          newAwayScore = Math.max(0, state.awayScore - 1);
        }
        console.log('🔴 [removeGoal] Score recalc:', {
          original: { home: state.homeScore, away: state.awayScore },
          team: goalToRemove.teamName,
          matchedHome: goalToRemove.teamName?.trim() === state.homeTeamName?.trim(),
          matchedAway: goalToRemove.teamName?.trim() === state.awayTeamName?.trim(),
          newHomeScore,
          newAwayScore,
        });
      }

      return {
        goals: state.goals.filter(g => g.id !== goalId),
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        hasUnsavedChanges: true,
        lastUpdated: Date.now()
      };
    });

    // Print all goals after removal
    const afterRemoveState = get();
    console.log('🗑️ [removeGoal] Store State After:', {
      homeScore: afterRemoveState.homeScore,
      awayScore: afterRemoveState.awayScore,
      goals: afterRemoveState.goals,
    });
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
  },

  // New: Defensive method to recalculate scores from current goals and team names
  recalculateScores: () => {
    const { goals, homeTeamName, awayTeamName } = get();
    let newHomeScore = 0;
    let newAwayScore = 0;
    for (const goal of goals) {
      if (goal.type === "goal") {
        if (goal.teamName?.trim() === homeTeamName?.trim()) {
          newHomeScore++;
        } else if (goal.teamName?.trim() === awayTeamName?.trim()) {
          newAwayScore++;
        }
      }
    }
    set((state) => ({
      ...state,
      homeScore: newHomeScore,
      awayScore: newAwayScore
    }));
    // Debug
    console.log("[recalculateScores] Defensive score tally:", { homeTeamName, awayTeamName, newHomeScore, newAwayScore, goalCount: goals.length });
  }
});
