
import { useCallback } from 'react';
import type { LocalMatchState } from './types';

export const useStateActions = (
  setLocalState: React.Dispatch<React.SetStateAction<LocalMatchState>>
) => {
  const markAsChanged = useCallback(() => {
    setLocalState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, [setLocalState]);

  const resetLocalState = useCallback(() => {
    setLocalState({
      homeScore: 0,
      awayScore: 0,
      goals: [],
      cards: [],
      playerTimes: [],
      events: [],
      lastSaved: null,
      hasUnsavedChanges: false
    });
    console.log('🔄 useLocalMatchState: Local state reset');
  }, [setLocalState]);

  const markAsSaved = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      goals: prev.goals.map(g => ({ ...g, synced: true })),
      cards: prev.cards.map(c => ({ ...c, synced: true })),
      playerTimes: prev.playerTimes.map(pt => ({ ...pt, synced: true })),
      lastSaved: Date.now(),
      hasUnsavedChanges: false
    }));
    console.log('✅ useLocalMatchState: Marked all data as saved');
  }, [setLocalState]);

  return {
    markAsChanged,
    resetLocalState,
    markAsSaved
  };
};
