
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { realTimeScoreService } from "@/services/fixtures/realTimeScoreService";
import { useMatchStore } from "@/stores/useMatchStore";

interface UseRealTimeScoreSyncProps {
  fixtureId?: number;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

export const useRealTimeScoreSync = ({
  fixtureId,
  autoSync = false,
  syncInterval = 5000 // 5 seconds
}: UseRealTimeScoreSyncProps = {}) => {
  const { toast } = useToast();
  const matchStore = useMatchStore();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);

  // Manual score sync function
  const syncScores = useCallback(async (showToast: boolean = true): Promise<void> => {
    if (!fixtureId) {
      console.warn('⚠️ useRealTimeScoreSync: No fixture ID provided for sync');
      return;
    }

    setIsLoading(true);
    setSyncErrors([]);

    try {
      console.log('🔄 useRealTimeScoreSync: Starting score synchronization for fixture:', fixtureId);
      
      // Use the syncScoresFromDatabase method if available
      if (matchStore.syncScoresFromDatabase) {
        await matchStore.syncScoresFromDatabase(fixtureId);
      }
      
      // Verify synchronization
      const verification = await realTimeScoreService.verifyScoreSync(fixtureId);
      
      if (!verification.isInSync && verification.discrepancy) {
        console.warn('⚠️ useRealTimeScoreSync: Score discrepancy detected:', verification.discrepancy);
        setSyncErrors([verification.discrepancy]);
        
        if (showToast) {
          toast({
            title: "Score Sync Warning",
            description: verification.discrepancy,
            variant: "default"
          });
        }
      } else if (showToast) {
        toast({
          title: "Scores Synchronized",
          description: `Match scores updated: ${verification.fixtureScores.home}-${verification.fixtureScores.away}`,
        });
      }
      
      setLastSyncTime(new Date());
      console.log('✅ useRealTimeScoreSync: Score synchronization completed successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      console.error('❌ useRealTimeScoreSync: Score sync failed:', errorMessage);
      
      setSyncErrors([errorMessage]);
      
      if (showToast) {
        toast({
          title: "Score Sync Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [fixtureId, matchStore, toast]);

  // Force score update in database based on goal events
  const forceScoreUpdate = useCallback(async (): Promise<void> => {
    if (!fixtureId) {
      console.warn('⚠️ useRealTimeScoreSync: No fixture ID provided for force update');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 useRealTimeScoreSync: Forcing score update for fixture:', fixtureId);
      
      const result = await realTimeScoreService.updateFixtureScoreRealTime(fixtureId);
      
      if (result.success) {
        // Sync the updated scores back to the store
        if (matchStore.syncScoresFromDatabase) {
          await matchStore.syncScoresFromDatabase(fixtureId);
        }
        
        setLastSyncTime(new Date());
        
        toast({
          title: "Score Updated",
          description: `Match score forced to ${result.homeScore}-${result.awayScore}`,
        });
        
        console.log('✅ useRealTimeScoreSync: Force score update completed:', result);
      } else {
        throw new Error(result.error || 'Force update failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ useRealTimeScoreSync: Force update failed:', errorMessage);
      
      setSyncErrors([errorMessage]);
      
      toast({
        title: "Force Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [fixtureId, matchStore, toast]);

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync || !fixtureId) return;

    console.log('🔄 useRealTimeScoreSync: Setting up auto-sync interval:', syncInterval);
    
    const interval = setInterval(() => {
      syncScores(false); // Don't show toast for auto-sync
    }, syncInterval);

    return () => {
      console.log('🔄 useRealTimeScoreSync: Cleaning up auto-sync interval');
      clearInterval(interval);
    };
  }, [autoSync, fixtureId, syncInterval, syncScores]);

  // Initial sync on mount
  useEffect(() => {
    if (fixtureId) {
      console.log('🔄 useRealTimeScoreSync: Performing initial score sync on mount');
      syncScores(false);
    }
  }, [fixtureId, syncScores]);

  return {
    syncScores,
    forceScoreUpdate,
    isLoading,
    lastSyncTime,
    syncErrors,
    hasSyncErrors: syncErrors.length > 0
  };
};
