
import { useMatchStore } from "@/stores/match";
import { useRef, useEffect } from "react";

// Optional: Expand or tweak - always one source of truth for local state
export const useUnifiedLocalMatchStore = () => {
  const store = useMatchStore();
  // You can plug in local hydration/persistence (for offline), or extra selectors here if needed

  // React to fixture id changes, clear/rehydrate as needed (future offline support)
  const lastFixture = useRef<number|null>(null);
  useEffect(() => {
    if (store.fixtureId && lastFixture.current !== store.fixtureId) {
      lastFixture.current = store.fixtureId;
      // Clear UI cache or reload match state here if needed
    }
  }, [store.fixtureId]);

  return store;
};
