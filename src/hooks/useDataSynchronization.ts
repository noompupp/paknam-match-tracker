
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataSynchronizationService, SyncResult } from '@/services/dataSynchronizationService';
import { syncExistingMatchEvents } from '@/services/fixtures/playerStatsSyncService';
import { useToast } from '@/hooks/use-toast';

export const useDataSynchronization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const syncMutation = useMutation({
    mutationFn: async () => {
      // First run the player stats sync with new cumulative calculation
      console.log('🔄 DataSynchronization: Running cumulative player stats sync...');
      const playerSyncResult = await syncExistingMatchEvents();
      
      // Then run the regular data sync
      console.log('🔄 DataSynchronization: Running full data synchronization...');
      const fullSyncResult = await dataSynchronizationService.performFullDataSync();
      
      // Combine results
      return {
        ...fullSyncResult,
        playerStatsSync: playerSyncResult,
        summary: `${fullSyncResult.summary}. Player stats: ${playerSyncResult.playersUpdated} players updated with cumulative totals.`
      };
    },
    onSuccess: (result) => {
      setLastSyncResult(result);
      
      // Comprehensive cache invalidation for immediate UI updates
      console.log('🗑️ Full sync cache invalidation: Clearing ALL related caches...');
      
      // Invalidate all enhanced player stats queries (new system)
      queryClient.invalidateQueries({ 
        queryKey: ['enhancedPlayerStats'],
        exact: false 
      });
      
      // Invalidate legacy and related queries
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      queryClient.invalidateQueries({ queryKey: ['matchEvents'] });
      queryClient.invalidateQueries({ queryKey: ['playerStats'] });
      queryClient.invalidateQueries({ queryKey: ['teamPlayerStats'] });
      queryClient.invalidateQueries({ queryKey: ['topScorers'] });
      queryClient.invalidateQueries({ queryKey: ['topAssists'] });
      
      console.log('✅ Full sync cache invalidation: All caches cleared');
      
      if (result.success) {
        toast({
          title: "Data Synchronization Complete! ✅",
          description: result.summary,
        });
      } else {
        toast({
          title: "Synchronization Issues Found",
          description: `${result.errors.length} errors occurred during sync. Check results for details.`,
          variant: "destructive"
        });
      }

      if (result.warnings.length > 0) {
        toast({
          title: "Data Inconsistencies Found",
          description: `${result.warnings.length} warnings detected. Check results for details.`,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      console.error('Data synchronization failed:', error);
      toast({
        title: "Synchronization Failed",
        description: error instanceof Error ? error.message : "Failed to synchronize data",
        variant: "destructive"
      });
    }
  });

  return {
    performFullSync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    lastSyncResult,
    syncError: syncMutation.error
  };
};
