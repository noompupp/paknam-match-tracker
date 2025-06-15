
import { useRef, useCallback } from "react";

/**
 * A generic queue for pending match events with flush/auto-flush capability.
 * This can be used for goals, cards, playerTimes, etc.
 */
export const useBatchEventQueue = <E>(
  flushFn: (batch: E[]) => Promise<any>,
  flushIntervalMs = 30000 // Default: 30 seconds
) => {
  const queueRef = useRef<E[]>([]);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Add event to queue and maybe schedule flush
  const add = useCallback((item: E) => {
    queueRef.current.push(item);

    // If not already scheduled, auto-schedule a flush
    if (!flushTimerRef.current) {
      flushTimerRef.current = setTimeout(() => {
        flush();
      }, flushIntervalMs);
    }
  }, [flushIntervalMs]);

  // Get all queued items (for inspection or manual batch save)
  const getAll = useCallback(() => [...queueRef.current], []);

  // Immediately flush pending events
  const flush = useCallback(async () => {
    if (queueRef.current.length === 0) return;
    const batch = [...queueRef.current];
    queueRef.current = [];
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = null;
    await flushFn(batch);
  }, [flushFn]);

  // Force set the queue (for testing or manual reset)
  const set = useCallback((items: E[]) => {
    queueRef.current = items;
  }, []);

  return { add, flush, getAll, set, size: () => queueRef.current.length };
};
