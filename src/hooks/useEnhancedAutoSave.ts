
import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseEnhancedAutoSaveProps {
  enabled: boolean;
  onAutoSave: () => Promise<void>;
  interval?: number;
  hasUnsavedChanges: boolean;
  tabName?: string;
  optimizedMode?: boolean;
  triggerOnActiveChanges?: boolean;
}

export const useEnhancedAutoSave = ({
  enabled,
  onAutoSave,
  interval = 5 * 60 * 1000, // 5 minutes default
  hasUnsavedChanges,
  tabName = 'Match',
  optimizedMode = false,
  triggerOnActiveChanges = false
}: UseEnhancedAutoSaveProps) => {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);
  const lastChangeRef = useRef<number>(0);

  const performAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges && !triggerOnActiveChanges) {
      console.log(`💾 Enhanced AutoSave (${tabName}): No changes to save`);
      return;
    }

    // In optimized mode, only save if there have been recent changes
    if (optimizedMode && Date.now() - lastChangeRef.current > 30000) {
      console.log(`⚡ Enhanced AutoSave (${tabName}): Skipping - no recent activity`);
      return;
    }

    try {
      console.log(`💾 Enhanced AutoSave (${tabName}): Starting ${optimizedMode ? 'optimized ' : ''}autosave...`);
      await onAutoSave();
      lastSaveRef.current = Date.now();
      
      toast({
        title: "Auto-saved",
        description: `${tabName} data automatically saved${optimizedMode ? ' (optimized)' : ''}`,
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
  }, [hasUnsavedChanges, onAutoSave, tabName, toast, optimizedMode, triggerOnActiveChanges]);

  // Track when changes occur
  useEffect(() => {
    if (hasUnsavedChanges) {
      lastChangeRef.current = Date.now();
    }
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Use shorter interval for optimized mode
    const actualInterval = optimizedMode ? Math.min(interval, 2 * 60 * 1000) : interval;
    
    intervalRef.current = setInterval(performAutoSave, actualInterval);

    console.log(`⏰ Enhanced AutoSave (${tabName}): ${optimizedMode ? 'Optimized a' : 'A'}utosave enabled with ${actualInterval / 1000}s interval`);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, performAutoSave, tabName, optimizedMode]);

  // Manual trigger function
  const triggerAutoSave = useCallback(() => {
    if (enabled && (hasUnsavedChanges || triggerOnActiveChanges)) {
      performAutoSave();
    }
  }, [enabled, hasUnsavedChanges, performAutoSave, triggerOnActiveChanges]);

  return {
    triggerAutoSave,
    lastSaveTime: lastSaveRef.current,
    isOptimized: optimizedMode
  };
};
