
import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { syncExistingMatchEvents, validatePlayerStats, cleanupDuplicateEvents } from '@/services/fixtures/playerStatsSyncService';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedSync } from '@/hooks/useEnhancedSync';

export const usePlayerStatsSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  const [lastValidationResult, setLastValidationResult] = useState<any>(null);
  const [lastCleanupResult, setLastCleanupResult] = useState<any>(null);
  const { recheckHealth } = useEnhancedSync();

  const syncMutation = useMutation({
    mutationFn: syncExistingMatchEvents,
    onSuccess: (result) => {
      setLastSyncResult(result);
      
      // Enhanced cache invalidation to refresh UI immediately
      console.log('🗑️ Quick sync cache invalidation: Clearing player stats caches...');
      
      // Invalidate all enhanced player stats queries (new system)
      queryClient.invalidateQueries({ 
        queryKey: ['enhancedPlayerStats'],
        exact: false 
      });
      
      // Also invalidate legacy queries for compatibility
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['topScorers'] });
      queryClient.invalidateQueries({ queryKey: ['topAssists'] });
      
      console.log('✅ Quick sync cache invalidation: Player stats caches cleared');
      
      // Update sync health status
      recheckHealth();
      
      if (result.playersUpdated > 0) {
        toast({
          title: "Stats Sync Complete!",
          description: `Updated ${result.playersUpdated} players: +${result.goalsAdded} goals, +${result.assistsAdded} assists`,
        });
      } else {
        toast({
          title: "Sync Complete",
          description: "No player stats needed updating. All stats are already synchronized.",
        });
      }

      if (result.errors.length > 0) {
        toast({
          title: "Sync Warnings",
          description: `${result.errors.length} warnings occurred during sync. Check results for details.`,
          variant: "destructive"
        });
      }

      if (result.warnings && result.warnings.length > 0) {
        toast({
          title: "Data Inconsistencies Found",
          description: `${result.warnings.length} potential data issues detected. Check results for details.`,
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
      setLastValidationResult(result);
      
      if (result.isValid) {
        toast({
          title: "Validation Passed ✅",
          description: "All player stats are consistent with match events",
        });
      } else {
        toast({
          title: "Validation Issues Found",
          description: `${result.issues.length} inconsistencies detected. Check validation results for details.`,
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

  const cleanupMutation = useMutation({
    mutationFn: cleanupDuplicateEvents,
    onSuccess: (result) => {
      setLastCleanupResult(result);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['matchEvents'] });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      
      if (result.removedEvents > 0) {
        toast({
          title: "Cleanup Complete!",
          description: `Removed ${result.removedEvents} duplicate events`,
        });
      } else {
        toast({
          title: "Cleanup Complete",
          description: "No duplicate events found to remove",
        });
      }

      if (result.errors.length > 0) {
        toast({
          title: "Cleanup Issues",
          description: `${result.errors.length} errors occurred during cleanup. Check console for details.`,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Cleanup Failed",
        description: error instanceof Error ? error.message : "Failed to cleanup duplicate events",
        variant: "destructive"
      });
    }
  });

  return {
    syncStats: syncMutation.mutate,
    validateStats: validateMutation.mutate,
    cleanupDuplicates: cleanupMutation.mutate,
    isSyncing: syncMutation.isPending,
    isValidating: validateMutation.isPending,
    isCleaningUp: cleanupMutation.isPending,
    lastSyncResult,
    lastValidationResult,
    lastCleanupResult
  };
};
