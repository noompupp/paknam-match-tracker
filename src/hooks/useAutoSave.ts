
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
  const lastSaveRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      if (hasUnsavedChanges && Date.now() - lastSaveRef.current > interval) {
        console.log('🔄 useAutoSave: Auto-save triggered');
        try {
          await onAutoSave();
          lastSaveRef.current = Date.now();
        } catch (error) {
          console.error('❌ useAutoSave: Auto-save failed:', error);
        }
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, onAutoSave, interval, hasUnsavedChanges]);

  // Manual trigger for auto-save
  const triggerAutoSave = async () => {
    if (hasUnsavedChanges) {
      console.log('🔄 useAutoSave: Manual auto-save triggered');
      try {
        await onAutoSave();
        lastSaveRef.current = Date.now();
      } catch (error) {
        console.error('❌ useAutoSave: Manual auto-save failed:', error);
      }
    }
  };

  return {
    triggerAutoSave
  };
};
