
import { useEffect } from "react";

// Placeholder hook for real-time score sync (now replaced with manual data fetching)
export const useRealTimeScoreSync = () => {
  useEffect(() => {
    console.log('✅ useRealTimeScoreSync: Real-time synchronization disabled - using manual data fetching');
    console.log('📡 useRealTimeScoreSync: Manual refresh buttons and local state management active');
  }, []);
};
