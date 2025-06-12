
import { useState, useCallback, useRef } from 'react';

interface ConditionalSyncConfig {
  minTimeBetweenSyncs: number; // milliseconds
  maxPendingChanges: number;
  activePlayersThreshold: number;
}

interface SyncConditions {
  hasActivePlayers: boolean;
  pendingChangesCount: number;
  timeSinceLastSync: number;
  shouldAutoSync: boolean;
}

export const useConditionalSync = (config: ConditionalSyncConfig = {
  minTimeBetweenSyncs: 30000, // 30 seconds
  maxPendingChanges: 10,
  activePlayersThreshold: 3
}) => {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [manualSyncOnly, setManualSyncOnly] = useState(false);
  const lastSyncTimeRef = useRef<number>(0);

  const evaluateSyncConditions = useCallback((
    activePlayersCount: number,
    pendingChangesCount: number
  ): SyncConditions => {
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTimeRef.current;
    const hasActivePlayers = activePlayersCount > 0;

    const shouldAutoSync = 
      autoSyncEnabled &&
      !manualSyncOnly &&
      hasActivePlayers &&
      timeSinceLastSync >= config.minTimeBetweenSyncs &&
      (
        pendingChangesCount >= config.maxPendingChanges ||
        activePlayersCount >= config.activePlayersThreshold
      );

    return {
      hasActivePlayers,
      pendingChangesCount,
      timeSinceLastSync,
      shouldAutoSync
    };
  }, [autoSyncEnabled, manualSyncOnly, config]);

  const markSyncCompleted = useCallback(() => {
    lastSyncTimeRef.current = Date.now();
  }, []);

  const enableAutoSync = useCallback(() => {
    setAutoSyncEnabled(true);
    setManualSyncOnly(false);
    console.log('✅ ConditionalSync: Auto-sync enabled');
  }, []);

  const disableAutoSync = useCallback(() => {
    setAutoSyncEnabled(false);
    console.log('⏸️ ConditionalSync: Auto-sync disabled');
  }, []);

  const enableManualSyncOnly = useCallback(() => {
    setManualSyncOnly(true);
    setAutoSyncEnabled(false);
    console.log('✋ ConditionalSync: Manual sync only mode enabled');
  }, []);

  const shouldSyncNow = useCallback((
    activePlayersCount: number,
    pendingChangesCount: number
  ): boolean => {
    const conditions = evaluateSyncConditions(activePlayersCount, pendingChangesCount);
    return conditions.shouldAutoSync;
  }, [evaluateSyncConditions]);

  const getSyncRecommendation = useCallback((
    activePlayersCount: number,
    pendingChangesCount: number
  ): string => {
    const conditions = evaluateSyncConditions(activePlayersCount, pendingChangesCount);
    
    if (!conditions.hasActivePlayers && pendingChangesCount === 0) {
      return "No changes to sync";
    }
    
    if (manualSyncOnly) {
      return `Manual sync mode: ${pendingChangesCount} changes pending`;
    }
    
    if (!autoSyncEnabled) {
      return `Auto-sync disabled: ${pendingChangesCount} changes pending`;
    }
    
    if (conditions.timeSinceLastSync < config.minTimeBetweenSyncs) {
      const remainingTime = Math.ceil((config.minTimeBetweenSyncs - conditions.timeSinceLastSync) / 1000);
      return `Next auto-sync in ${remainingTime}s`;
    }
    
    if (conditions.shouldAutoSync) {
      return "Ready for auto-sync";
    }
    
    if (pendingChangesCount < config.maxPendingChanges && activePlayersCount < config.activePlayersThreshold) {
      return `Waiting for more activity (${pendingChangesCount}/${config.maxPendingChanges} changes, ${activePlayersCount}/${config.activePlayersThreshold} active players)`;
    }
    
    return "Sync conditions not met";
  }, [evaluateSyncConditions, autoSyncEnabled, manualSyncOnly, config]);

  return {
    autoSyncEnabled,
    manualSyncOnly,
    evaluateSyncConditions,
    shouldSyncNow,
    getSyncRecommendation,
    markSyncCompleted,
    enableAutoSync,
    disableAutoSync,
    enableManualSyncOnly
  };
};
