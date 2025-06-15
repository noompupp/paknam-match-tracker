
import { useEffect, useRef } from 'react';
import { useMatchStore } from '@/stores/useMatchStore';

interface UseAutoSyncOptions {
  enabled?: boolean;
  interval?: number;
  onAutoSave?: () => Promise<void>;
  hasUnsavedChanges?: boolean;
}

export const useAutoSync = ({
  enabled = true,
  interval = 5000, // 5 seconds
  onAutoSave,
  hasUnsavedChanges
}: UseAutoSyncOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { 
    isAutoSyncEnabled, 
    isSyncing, 
    syncToDatabase,
    enableAutoSync,
    disableAutoSync
  } = useMatchStore();

  useEffect(() => {
    if (enabled) {
      enableAutoSync();
    } else {
      disableAutoSync();
    }
  }, [enabled, enableAutoSync, disableAutoSync]);

  useEffect(() => {
    if (!isAutoSyncEnabled || !enabled || isSyncing || !hasUnsavedChanges) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    console.log('🔄 Scheduling auto-sync in', interval, 'ms');

    timeoutRef.current = setTimeout(async () => {
      try {
        if (onAutoSave) {
          await onAutoSave();
        } else {
          await syncToDatabase();
        }
      } catch (error) {
        console.error('❌ Auto-sync failed:', error);
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    isAutoSyncEnabled, 
    enabled, 
    isSyncing, 
    hasUnsavedChanges, 
    interval, 
    onAutoSave, 
    syncToDatabase
  ]);

  return {
    isAutoSyncEnabled,
    isSyncing,
    enableAutoSync,
    disableAutoSync
  };
};
