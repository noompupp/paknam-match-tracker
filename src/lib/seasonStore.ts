/**
 * Module-level singleton holding the currently viewed season id.
 * Read by data services so they can scope queries by season without prop drilling.
 * Updated by SeasonContext.
 */

const STORAGE_KEY = "current_season_id";

let currentSeasonId: string | null =
  typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

const listeners = new Set<(id: string | null) => void>();

export function getCurrentSeasonId(): string | null {
  return currentSeasonId;
}

export function setCurrentSeasonId(id: string | null): void {
  if (id === currentSeasonId) return;
  currentSeasonId = id;
  if (typeof window !== "undefined") {
    if (id) {
      window.localStorage.setItem(STORAGE_KEY, id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
  listeners.forEach((l) => l(id));
}

export function subscribeToSeasonChanges(
  listener: (id: string | null) => void
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}