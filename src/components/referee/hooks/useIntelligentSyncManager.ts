
import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMatchStore } from "@/stores/match";

export interface SyncStatus {
  isSyncing: boolean;
  lastError: string | null;
  lastSuccess: number | null;
  pendingChanges: number;
}

export const useIntelligentSyncManager = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastError: null,
    lastSuccess: null,
    pendingChanges: 0
  });
  const debounceTimer = useRef<NodeJS.Timeout>();
  const maxIntervalTimer = useRef<NodeJS.Timeout>();
  const isMounted = useRef(true);

  // Get required fields/actions from store
  const {
    fixtureId,
    hasUnsavedChanges,
    getUnsavedItemsCount,
    syncAllToDatabase
  } = useMatchStore();

  // Calculate sum of all unsaved items (goals, cards, playerTimes)
  const getTotalPendingChanges = useCallback(() => {
    if (typeof getUnsavedItemsCount !== "function") return 0;
    const counts = getUnsavedItemsCount();
    return (counts.goals ?? 0) + (counts.cards ?? 0) + (counts.playerTimes ?? 0);
  }, [getUnsavedItemsCount]);

  // Sync function, batched & robust
  const executeSync = useCallback(async () => {
    if (!fixtureId) return;
    setStatus((s) => ({ ...s, isSyncing: true, lastError: null }));
    try {
      await syncAllToDatabase(fixtureId);
      setStatus((s) => ({
        ...s,
        isSyncing: false,
        lastError: null,
        lastSuccess: Date.now(),
        pendingChanges: 0
      }));
      toast({ title: "Match Data Synced", description: "All changes saved!" });
    } catch (error: any) {
      setStatus(s => ({
        ...s,
        isSyncing: false,
        lastError: error?.message || "Sync failed"
      }));
      toast({
        title: "Sync Failed",
        description: error?.message ?? "Unknown sync error",
        variant: "destructive"
      });
    }
  }, [fixtureId, syncAllToDatabase, toast]);

  // Schedule debounced/batched sync
  const scheduleSync = useCallback(() => {
    const pending = getTotalPendingChanges();
    setStatus((s) => ({
      ...s,
      pendingChanges: typeof pending === "number" ? pending : 0
    }));
    if (!hasUnsavedChanges) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => executeSync(), 15000); // 15s debounce

    if (!maxIntervalTimer.current) {
      maxIntervalTimer.current = setTimeout(() => {
        executeSync();
        maxIntervalTimer.current = undefined;
      }, 120000); // 2 min max
    }
  }, [executeSync, hasUnsavedChanges, getTotalPendingChanges]);

  // Listen for unsaved local changes
  useEffect(() => {
    if (!isMounted.current) return;
    if (hasUnsavedChanges) {
      scheduleSync();
    }
    return () => {
      clearTimeout(debounceTimer.current);
      clearTimeout(maxIntervalTimer.current);
    };
  }, [hasUnsavedChanges, scheduleSync]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(debounceTimer.current);
      clearTimeout(maxIntervalTimer.current);
    };
  }, []);

  // Manual trigger
  const forceSync = async () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (maxIntervalTimer.current) clearTimeout(maxIntervalTimer.current);
    await executeSync();
  };

  return {
    syncStatus: status,
    forceSync,
    pendingChanges: status.pendingChanges
  };
};
