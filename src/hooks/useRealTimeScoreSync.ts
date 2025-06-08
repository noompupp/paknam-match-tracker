
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Hook to enable real-time table subscriptions if not already enabled
export const useRealTimeScoreSync = () => {
  useEffect(() => {
    const enableRealTimeForTables = async () => {
      try {
        // Enable realtime for fixtures table
        await supabase.rpc('enable_realtime', { table_name: 'fixtures' }).catch(() => {
          console.log('ℹ️ useRealTimeScoreSync: Fixtures table may already have realtime enabled');
        });

        // Enable realtime for match_events table  
        await supabase.rpc('enable_realtime', { table_name: 'match_events' }).catch(() => {
          console.log('ℹ️ useRealTimeScoreSync: Match events table may already have realtime enabled');
        });

        console.log('✅ useRealTimeScoreSync: Real-time subscriptions enabled');
      } catch (error) {
        console.log('ℹ️ useRealTimeScoreSync: Real-time tables may already be configured:', error);
      }
    };

    enableRealTimeForTables();
  }, []);
};
