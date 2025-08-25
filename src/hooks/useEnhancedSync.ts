import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncHealthStatus {
  sync_health: 'healthy' | 'unhealthy' | 'stale';
  last_sync: string | null;
  total_goal_assist_events: number;
  total_players_with_stats: number;
  discrepancy_status: {
    has_discrepancies: boolean;
    discrepancy_count: number;
    discrepancies: Array<{
      player_name: string;
      stored_goals: number;
      actual_goals: number;
      stored_assists: number;
      actual_assists: number;
      goals_diff: number;
      assists_diff: number;
    }>;
  };
  sync_enabled: boolean;
  status_checked_at: string;
}

interface ManualSyncResult {
  success: boolean;
  players_updated: number;
  discrepancies_before: number;
  discrepancies_after: number;
  discrepancies_fixed: number;
  sync_health_improved: boolean;
  manual_sync_at: string;
}

export const useEnhancedSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSyncResult, setLastSyncResult] = useState<ManualSyncResult | null>(null);

  // Query for sync health status
  const { 
    data: syncHealth, 
    isLoading: isCheckingHealth,
    refetch: recheckHealth 
  } = useQuery({
    queryKey: ['syncHealthStatus'],
    queryFn: async (): Promise<SyncHealthStatus> => {
      const { data, error } = await supabase.rpc('get_sync_health_status');
      if (error) throw error;
      return data as unknown as SyncHealthStatus;
    },
    refetchInterval: 60000, // Check every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });

  // Query for discrepancy detection
  const discrepancyQuery = useQuery({
    queryKey: ['syncDiscrepancies'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('detect_sync_discrepancies');
      if (error) throw error;
      return data as any;
    },
    enabled: false, // Only run when explicitly called
  });

  // Manual sync mutation
  const manualSyncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('manual_sync_player_stats');
      if (error) throw error;
      return data as unknown as ManualSyncResult;
    },
    onSuccess: (result) => {
      setLastSyncResult(result);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['enhancedPlayerStats'] });
      queryClient.invalidateQueries({ queryKey: ['topScorers'] });
      queryClient.invalidateQueries({ queryKey: ['topAssists'] });
      queryClient.invalidateQueries({ queryKey: ['syncHealthStatus'] });
      queryClient.invalidateQueries({ queryKey: ['syncDiscrepancies'] });
      
      if (result.success && result.discrepancies_fixed > 0) {
        toast({
          title: "Manual Sync Complete! ✅",
          description: `Fixed ${result.discrepancies_fixed} discrepancies and updated ${result.players_updated} players.`,
        });
      } else if (result.success) {
        toast({
          title: "Sync Complete",
          description: "No discrepancies found. All stats are already synchronized.",
        });
      } else {
        toast({
          title: "Sync Issues",
          description: "Manual sync completed but some issues may remain. Check logs for details.",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      console.error('Manual sync failed:', error);
      toast({
        title: "Manual Sync Failed",
        description: error instanceof Error ? error.message : "Failed to perform manual sync",
        variant: "destructive"
      });
    }
  });

  // Periodic background sync trigger
  const backgroundSyncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('periodic-sync');
      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      if (result.action === 'sync_performed') {
        queryClient.invalidateQueries({ queryKey: ['members'] });
        queryClient.invalidateQueries({ queryKey: ['enhancedPlayerStats'] });
        queryClient.invalidateQueries({ queryKey: ['topScorers'] });
        queryClient.invalidateQueries({ queryKey: ['topAssists'] });
        queryClient.invalidateQueries({ queryKey: ['syncHealthStatus'] });
        
        toast({
          title: "Background Sync Complete",
          description: result.message,
        });
      }
    },
    onError: (error) => {
      console.error('Background sync failed:', error);
      toast({
        title: "Background Sync Failed",
        description: error instanceof Error ? error.message : "Background sync encountered an error",
        variant: "destructive"
      });
    }
  });

  return {
    // Sync health status
    syncHealth,
    isCheckingHealth,
    recheckHealth,
    
    // Discrepancy detection
    checkDiscrepancies: discrepancyQuery.refetch,
    discrepancies: discrepancyQuery.data,
    isCheckingDiscrepancies: discrepancyQuery.isFetching,
    
    // Manual sync
    performManualSync: manualSyncMutation.mutate,
    isPerformingManualSync: manualSyncMutation.isPending,
    lastSyncResult,
    
    // Background sync
    triggerBackgroundSync: backgroundSyncMutation.mutate,
    isPerformingBackgroundSync: backgroundSyncMutation.isPending,
    
    // Helper methods
    hasDiscrepancies: (syncHealth as any)?.discrepancy_status?.has_discrepancies || false,
    isHealthy: (syncHealth as any)?.sync_health === 'healthy',
    needsAttention: (syncHealth as any)?.sync_health === 'unhealthy' || (syncHealth as any)?.sync_health === 'stale',
  };
};