
import { useState, useEffect, useCallback } from 'react';
import { coordinationService, CoordinationData } from '@/services/referee/coordinationService';
import { useToast } from '@/hooks/use-toast';

export const useCoordinationManager = (fixtureId: number | null) => {
  const [coordinationData, setCoordinationData] = useState<CoordinationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadCoordinationData = useCallback(async () => {
    if (!fixtureId) return;

    try {
      setIsLoading(true);
      setLastError(null);
      console.log('🎯 useCoordinationManager: Loading coordination data for fixture:', fixtureId);

      const data = await coordinationService.getCoordinationData(fixtureId);
      
      if (!data) {
        console.log('ℹ️ useCoordinationManager: No coordination data found');
        setCoordinationData(null);
        return;
      }

      console.log('✅ useCoordinationManager: Coordination data loaded:', data);
      setCoordinationData(data);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load coordination data';
      console.error('❌ useCoordinationManager: Error loading coordination data:', error);
      setLastError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [fixtureId, toast]);

  const activateAssignment = useCallback(async (assignmentId: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 useCoordinationManager: Activating assignment:', assignmentId);

      await coordinationService.activateAssignment(assignmentId);
      
      // Reload coordination data to reflect changes
      await loadCoordinationData();
      
      toast({
        title: "Success",
        description: "Assignment activated successfully",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate assignment';
      console.error('❌ useCoordinationManager: Error activating assignment:', error);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadCoordinationData, toast]);

  const completeAssignment = useCallback(async (assignmentId: string, notes?: string) => {
    try {
      setIsLoading(true);
      console.log('✅ useCoordinationManager: Completing assignment:', assignmentId);

      await coordinationService.completeAssignment(assignmentId, notes);
      
      // Reload coordination data to reflect changes
      await loadCoordinationData();
      
      toast({
        title: "Success",
        description: "Assignment completed successfully",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete assignment';
      console.error('❌ useCoordinationManager: Error completing assignment:', error);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadCoordinationData, toast]);

  const retryLoadData = useCallback(() => {
    console.log('🔄 useCoordinationManager: Retrying to load coordination data...');
    loadCoordinationData();
  }, [loadCoordinationData]);

  useEffect(() => {
    if (fixtureId) {
      loadCoordinationData();
    } else {
      setCoordinationData(null);
      setLastError(null);
    }
  }, [fixtureId, loadCoordinationData]);

  return {
    coordinationData,
    isLoading,
    lastError,
    activateAssignment,
    completeAssignment,
    retryLoadData
  };
};
