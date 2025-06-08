
import { useEffect, useRef } from 'react';

interface UseAutoSaveProps {
  enabled: boolean;
  onAutoSave: () => Promise<any>;
  interval?: number; // in milliseconds
  hasUnsavedChanges: boolean;
}

export const useAutoSave = ({
  enabled,
  onAutoSave,
  interval = 30000, // 30 seconds default
  hasUnsavedChanges
}: UseAutoSaveProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('🔄 useAutoSave: Setting up auto-save with interval:', interval);

    intervalRef.current = setInterval(async () => {
      console.log('⏰ useAutoSave: Auto-save triggered');
      try {
        await onAutoSave();
      } catch (error) {
        console.error('❌ useAutoSave: Auto-save failed:', error);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, hasUnsavedChanges, onAutoSave, interval]);

  return {
    isAutoSaveEnabled: enabled && hasUnsavedChanges
  };
};
