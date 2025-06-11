
import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseEnhancedAutoSaveProps {
  enabled: boolean;
  onAutoSave: () => Promise<void>;
  interval?: number;
  hasUnsavedChanges: boolean;
  tabName?: string;
}

export const useEnhancedAutoSave = ({
  enabled,
  onAutoSave,
  interval = 5 * 60 * 1000, // 5 minutes default
  hasUnsavedChanges,
  tabName = 'Match'
}: UseEnhancedAutoSaveProps) => {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  const performAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges) {
      console.log(`💾 Enhanced AutoSave (${tabName}): No changes to save`);
      return;
    }

    try {
      console.log(`💾 Enhanced AutoSave (${tabName}): Starting autosave...`);
      await onAutoSave();
      lastSaveRef.current = Date.now();
      
      toast({
        title: "Auto-saved",
        description: `${tabName} data automatically saved`,
        duration: 2000,
      });
      
      console.log(`✅ Enhanced AutoSave (${tabName}): Autosave completed successfully`);
    } catch (error) {
      console.error(`❌ Enhanced AutoSave (${tabName}): Autosave failed:`, error);
      
      toast({
        title: "Auto-save failed",
        description: `Failed to auto-save ${tabName} data. Please save manually.`,
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [hasUnsavedChanges, onAutoSave, tabName, toast]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up autosave interval
    intervalRef.current = setInterval(performAutoSave, interval);

    console.log(`⏰ Enhanced AutoSave (${tabName}): Autosave enabled with ${interval / 1000}s interval`);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, performAutoSave, tabName]);

  // Manual trigger function
  const triggerAutoSave = useCallback(() => {
    if (enabled && hasUnsavedChanges) {
      performAutoSave();
    }
  }, [enabled, hasUnsavedChanges, performAutoSave]);

  return {
    triggerAutoSave,
    lastSaveTime: lastSaveRef.current
  };
};
