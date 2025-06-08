
import { useCallback } from 'react';
import type { LocalMatchState } from './types';

export const useEventActions = (
  setLocalState: React.Dispatch<React.SetStateAction<LocalMatchState>>,
  generateId: () => string
) => {
  const addLocalEvent = useCallback((type: string, description: string, time: number) => {
    const newEvent = {
      id: generateId(),
      type,
      description,
      time,
      timestamp: Date.now()
    };

    setLocalState(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
      hasUnsavedChanges: true
    }));

    return newEvent;
  }, [generateId, setLocalState]);

  return {
    addLocalEvent
  };
};
