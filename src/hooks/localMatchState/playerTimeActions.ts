
import { useCallback } from 'react';
import type { LocalPlayerTime, LocalMatchState } from './types';

export const usePlayerTimeActions = (
  setLocalState: React.Dispatch<React.SetStateAction<LocalMatchState>>,
  generateId: () => string
) => {
  const addLocalPlayerTime = useCallback((playerData: Omit<LocalPlayerTime, 'id' | 'timestamp' | 'synced'>) => {
    const newPlayerTime: LocalPlayerTime = {
      ...playerData,
      id: generateId(),
      synced: false
    };

    setLocalState(prev => ({
      ...prev,
      playerTimes: [...prev.playerTimes, newPlayerTime],
      hasUnsavedChanges: true
    }));

    return newPlayerTime;
  }, [generateId, setLocalState]);

  const updateLocalPlayerTime = useCallback((playerId: number, updates: Partial<LocalPlayerTime>) => {
    setLocalState(prev => ({
      ...prev,
      playerTimes: prev.playerTimes.map(pt => 
        pt.playerId === playerId 
          ? { ...pt, ...updates, synced: false }
          : pt
      ),
      hasUnsavedChanges: true
    }));
  }, [setLocalState]);

  return {
    addLocalPlayerTime,
    updateLocalPlayerTime
  };
};
