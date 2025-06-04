
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataSynchronizationService, SyncResult } from '@/services/dataSynchronizationService';
import { useToast } from '@/hooks/use-toast';

export const useDataSynchronization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const syncMutation = useMutation({
    mutationFn: dataSynchronizationService.performFullDataSync,
    onSuccess: (result) => {
      setLastSyncResult(result);
      
      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      queryClient.invalidateQueries({ queryKey: ['matchEvents'] });
      queryClient.invalidateQueries({ queryKey: ['enhancedTopScorers'] });
      queryClient.invalidateQueries({ queryKey: ['enhancedTopAssists'] });
      queryClient.invalidateQueries({ queryKey: ['playerStats'] });
      queryClient.invalidateQueries({ queryKey: ['teamPlayerStats'] });
      
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
