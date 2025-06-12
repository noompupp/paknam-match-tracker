
import { useCallback, useRef, useState } from 'react';
import { playerTimeTrackingService } from '@/services/fixtures/playerTimeTrackingService';
import { OptimizedPlayerTime } from '@/types/optimizedPlayerTime';

interface SyncManagerConfig {
  debounceInterval: number; // milliseconds
  maxSyncInterval: number; // milliseconds
  autoSyncEnabled: boolean;
}

interface SyncStatus {
  lastSyncTime: number | null;
  pendingChanges: number;
  isSyncing: boolean;
  lastError: string | null;
}

export const useSyncManager = (config: SyncManagerConfig = {
  debounceInterval: 30000, // 30 seconds
  maxSyncInterval: 120000, // 2 minutes max
  autoSyncEnabled: true
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    pendingChanges: 0,
    isSyncing: false,
    lastError: null
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const maxIntervalTimerRef = useRef<NodeJS.Timeout>();
  const pendingDataRef = useRef<Map<number, OptimizedPlayerTime>>(new Map());

  const executeSync = useCallback(async (fixtureId: number) => {
    if (!fixtureId || pendingDataRef.current.size === 0) return;

    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, lastError: null }));
      console.log('🔄 SyncManager: Executing sync for', pendingDataRef.current.size, 'players');

      const playersToSync = Array.from(pendingDataRef.current.values());
      
      for (const playerTime of playersToSync) {
        await playerTimeTrackingService.savePlayerTime({
          fixture_id: fixtureId,
          player_id: playerTime.playerId,
          player_name: playerTime.playerName,
          team_id: parseInt(playerTime.teamId),
          total_minutes: playerTime.totalTime,
          periods: playerTime.periods || []
        });
      }

      // Clear pending data after successful sync
      pendingDataRef.current.clear();
      
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: Date.now(),
        pendingChanges: 0,
        isSyncing: false
      }));

      console.log('✅ SyncManager: Sync completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      console.error('❌ SyncManager: Sync failed:', error);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastError: errorMessage
      }));
    }
  }, []);

  const scheduleSync = useCallback((fixtureId: number, playerTime: OptimizedPlayerTime) => {
    // Add to pending changes
    pendingDataRef.current.set(playerTime.playerId, playerTime);
    
    setSyncStatus(prev => ({
      ...prev,
      pendingChanges: pendingDataRef.current.size
    }));

    if (!config.autoSyncEnabled) {
      console.log('⏸️ SyncManager: Auto-sync disabled, changes queued for manual sync');
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      executeSync(fixtureId);
    }, config.debounceInterval);

    // Set max interval timer if not already set
    if (!maxIntervalTimerRef.current && pendingDataRef.current.size > 0) {
      maxIntervalTimerRef.current = setTimeout(() => {
        console.log('⏰ SyncManager: Max interval reached, forcing sync');
        executeSync(fixtureId);
        maxIntervalTimerRef.current = undefined;
      }, config.maxSyncInterval);
    }

    console.log('⏱️ SyncManager: Sync scheduled for', config.debounceInterval / 1000, 'seconds');
  }, [config.autoSyncEnabled, config.debounceInterval, config.maxSyncInterval, executeSync]);

  const forceSyncNow = useCallback(async (fixtureId: number) => {
    // Clear any pending timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = undefined;
    }
    if (maxIntervalTimerRef.current) {
      clearTimeout(maxIntervalTimerRef.current);
      maxIntervalTimerRef.current = undefined;
    }

    await executeSync(fixtureId);
  }, [executeSync]);

  const clearPendingChanges = useCallback(() => {
    pendingDataRef.current.clear();
    setSyncStatus(prev => ({ ...prev, pendingChanges: 0 }));
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = undefined;
    }
    if (maxIntervalTimerRef.current) {
      clearTimeout(maxIntervalTimerRef.current);
      maxIntervalTimerRef.current = undefined;
    }
  }, []);

  return {
    syncStatus,
    scheduleSync,
    forceSyncNow,
    clearPendingChanges,
    pendingPlayerIds: Array.from(pendingDataRef.current.keys())
  };
};
