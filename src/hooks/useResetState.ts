
import { useState, useCallback } from "react";

interface ResetStateProps {
  fixtureId?: number;
}

export const useResetState = (props?: ResetStateProps) => {
  const [isResetInProgress, setIsResetInProgress] = useState(false);
  const [lastResetTimestamp, setLastResetTimestamp] = useState<string | null>(null);
  const [resetFixtureId, setResetFixtureId] = useState<number | null>(null);

  // Check if we're in a fresh reset state for the current fixture
  const isInFreshResetState = useCallback(() => {
    return props?.fixtureId === resetFixtureId && 
           lastResetTimestamp !== null && 
           isResetInProgress === false;
  }, [props?.fixtureId, resetFixtureId, lastResetTimestamp, isResetInProgress]);

  // Start reset operation
  const startReset = useCallback((fixtureId: number) => {
    console.log('🔄 useResetState: Starting reset for fixture:', fixtureId);
    setIsResetInProgress(true);
    setResetFixtureId(fixtureId);
    setLastResetTimestamp(null);
  }, []);

  // Complete reset operation
  const completeReset = useCallback((timestamp: string) => {
    console.log('✅ useResetState: Completing reset with timestamp:', timestamp);
    setIsResetInProgress(false);
    setLastResetTimestamp(timestamp);
  }, []);

  // Clear reset state (when switching fixtures or after data sync)
  const clearResetState = useCallback(() => {
    console.log('🧹 useResetState: Clearing reset state');
    setIsResetInProgress(false);
    setLastResetTimestamp(null);
    setResetFixtureId(null);
  }, []);

  // Check if data should be prioritized from local state
  const shouldUseLocalState = useCallback(() => {
    return isInFreshResetState();
  }, [isInFreshResetState]);

  return {
    isResetInProgress,
    lastResetTimestamp,
    resetFixtureId,
    isInFreshResetState,
    shouldUseLocalState,
    startReset,
    completeReset,
    clearResetState
  };
};
