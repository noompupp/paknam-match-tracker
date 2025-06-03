
import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { syncExistingMatchEvents, validatePlayerStats } from '@/services/fixtures/playerStatsSyncService';
import { useToast } from '@/hooks/use-toast';

export const usePlayerStatsSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);

  const syncMutation = useMutation({
    mutationFn: syncExistingMatchEvents,
    onSuccess: (result) => {
      setLastSyncResult(result);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['members'] });
      
      toast({
        title: "Stats Sync Complete!",
        description: `Updated ${result.playersUpdated} players: +${result.goalsAdded} goals, +${result.assistsAdded} assists`,
      });

      if (result.errors.length > 0) {
        toast({
          title: "Sync Warnings",
          description: `${result.errors.length} warnings occurred during sync. Check console for details.`,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync player stats",
        variant: "destructive"
      });
    }
  });

  const validateMutation = useMutation({
    mutationFn: validatePlayerStats,
    onSuccess: (result) => {
      if (result.isValid) {
        toast({
          title: "Validation Passed",
          description: "All player stats are consistent with match events",
        });
      } else {
        toast({
          title: "Validation Issues Found",
          description: `${result.issues.length} inconsistencies detected. Check console for details.`,
          variant: "destructive"
        });
        console.warn('Stats validation issues:', result.issues);
      }
    },
    onError: (error) => {
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Failed to validate player stats",
        variant: "destructive"
      });
    }
  });

  return {
    syncStats: syncMutation.mutate,
    validateStats: validateMutation.mutate,
    isSyncing: syncMutation.isPending,
    isValidating: validateMutation.isPending,
    lastSyncResult
  };
};
