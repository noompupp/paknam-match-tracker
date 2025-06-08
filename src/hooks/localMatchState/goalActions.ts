
import { useCallback } from 'react';
import type { LocalGoal, LocalMatchState } from './types';

export const useGoalActions = (
  setLocalState: React.Dispatch<React.SetStateAction<LocalMatchState>>,
  generateId: () => string
) => {
  const addLocalGoal = useCallback((goalData: Omit<LocalGoal, 'id' | 'timestamp' | 'synced'>) => {
    const newGoal: LocalGoal = {
      ...goalData,
      id: generateId(),
      timestamp: Date.now(),
      synced: false
    };

    setLocalState(prev => {
      const newHomeScore = goalData.team === 'home' ? prev.homeScore + 1 : prev.homeScore;
      const newAwayScore = goalData.team === 'away' ? prev.awayScore + 1 : prev.awayScore;
      
      return {
        ...prev,
        goals: [...prev.goals, newGoal],
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        hasUnsavedChanges: true
      };
    });

    console.log('📊 useLocalMatchState: Added local goal:', newGoal);
    return newGoal;
  }, [generateId, setLocalState]);

  const updateLocalGoal = useCallback((goalId: string, updates: Partial<LocalGoal>) => {
    setLocalState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates, synced: false }
          : goal
      ),
      hasUnsavedChanges: true
    }));
  }, [setLocalState]);

  const removeLocalGoal = useCallback((goalId: string) => {
    setLocalState(prev => {
      const goalToRemove = prev.goals.find(g => g.id === goalId);
      if (!goalToRemove) return prev;

      const newHomeScore = goalToRemove.team === 'home' ? prev.homeScore - 1 : prev.homeScore;
      const newAwayScore = goalToRemove.team === 'away' ? prev.awayScore - 1 : prev.awayScore;

      return {
        ...prev,
        goals: prev.goals.filter(g => g.id !== goalId),
        homeScore: Math.max(0, newHomeScore),
        awayScore: Math.max(0, newAwayScore),
        hasUnsavedChanges: true
      };
    });
  }, [setLocalState]);

  return {
    addLocalGoal,
    updateLocalGoal,
    removeLocalGoal
  };
};
