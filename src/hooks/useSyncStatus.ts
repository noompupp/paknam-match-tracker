import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SyncStatus {
  lastAutoSync: string | null;
  totalGoalAssistEvents: number;
  totalPlayersWithStats: number;
  syncEnabled: boolean;
  statusCheckedAt: string;
}

export const useSyncStatus = (enablePolling: boolean = false) => {
  return useQuery({
    queryKey: ['syncStatus'],
    queryFn: async (): Promise<SyncStatus> => {
      console.log('🔍 SyncStatus: Fetching sync status...');
      
      const { data, error } = await supabase
        .rpc('get_player_stats_sync_status');

      if (error) {
        console.error('❌ SyncStatus: Error fetching sync status:', error);
        throw error;
      }

      console.log('✅ SyncStatus: Status retrieved:', data);
      
      // Type assertion for the RPC response
      const statusData = data as any;
      
      return {
        lastAutoSync: statusData.last_auto_sync,
        totalGoalAssistEvents: statusData.total_goal_assist_events,
        totalPlayersWithStats: statusData.total_players_with_stats,
        syncEnabled: statusData.sync_enabled,
        statusCheckedAt: statusData.status_checked_at
      };
    },
    refetchInterval: enablePolling ? 30000 : false, // Poll every 30 seconds if enabled
    staleTime: 10000, // Consider data stale after 10 seconds
    refetchOnWindowFocus: true,
  });
};

export const usePeriodicSync = (intervalMinutes: number = 30) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastBackgroundSync, setLastBackgroundSync] = useState<Date | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    console.log(`🔄 PeriodicSync: Starting background sync every ${intervalMinutes} minutes`);

    const performBackgroundSync = async () => {
      try {
        console.log('🔄 PeriodicSync: Executing background sync...');
        
        const { data, error } = await supabase
          .rpc('calculate_cumulative_player_stats');

        if (error) {
          console.error('❌ PeriodicSync: Background sync failed:', error);
          return;
        }

        setLastBackgroundSync(new Date());
        console.log('✅ PeriodicSync: Background sync completed:', data);
      } catch (error) {
        console.error('❌ PeriodicSync: Background sync error:', error);
      }
    };

    // Initial sync
    performBackgroundSync();

    // Set up interval
    const interval = setInterval(performBackgroundSync, intervalMinutes * 60 * 1000);

    return () => {
      console.log('⏹️ PeriodicSync: Stopping background sync');
      clearInterval(interval);
    };
  }, [isEnabled, intervalMinutes]);

  return {
    isEnabled,
    setIsEnabled,
    lastBackgroundSync,
  };
};