
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { coordinationService, CoordinationData } from '@/services/referee/coordinationService';

export const useCoordinationManager = (fixtureId: number | null) => {
  const [coordinationData, setCoordinationData] = useState<CoordinationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadCoordinationData = useCallback(async () => {
    if (!fixtureId) {
      setCoordinationData(null);
      return;
    }

    try {
      setIsLoading(true);
      const data = await coordinationService.getCoordinationData(fixtureId);
      setCoordinationData(data);
    } catch (error) {
      console.error('Error loading coordination data:', error);
      toast({
        title: "Error",
        description: "Failed to load coordination data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [fixtureId, toast]);

  const completeAssignment = useCallback(async (assignmentId: string, notes?: string) => {
    try {
      setIsLoading(true);
      const result = await coordinationService.completeAssignment(assignmentId, notes);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Assignment completed successfully",
        });
        await loadCoordinationData();
      } else {
        throw new Error(result.error || 'Failed to complete assignment');
      }
    } catch (error) {
      console.error('Error completing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to complete assignment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadCoordinationData, toast]);

  const activateAssignment = useCallback(async (assignmentId: string) => {
    try {
      setIsLoading(true);
      await coordinationService.activateAssignment(assignmentId);
      
      toast({
        title: "Success",
        description: "Assignment activated successfully",
      });
      await loadCoordinationData();
    } catch (error) {
      console.error('Error activating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to activate assignment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadCoordinationData, toast]);

  useEffect(() => {
    loadCoordinationData();
  }, [loadCoordinationData]);

  return {
    coordinationData,
    isLoading,
    loadCoordinationData,
    completeAssignment,
    activateAssignment
  };
};
