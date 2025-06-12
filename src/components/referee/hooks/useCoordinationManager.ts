
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { coordinationService, CoordinationData, AssignmentData } from '@/services/referee/coordinationService';

export const useCoordinationManager = (fixtureId: number | null) => {
  const [coordinationData, setCoordinationData] = useState<CoordinationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (fixtureId) {
      loadCoordinationData();
    }
  }, [fixtureId]);

  const loadCoordinationData = async () => {
    if (!fixtureId) return;

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
  };

  const activateAssignment = async (assignmentId: string) => {
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
  };

  const completeAssignment = async (assignmentId: string, notes?: string) => {
    try {
      setIsLoading(true);
      await coordinationService.completeAssignment(assignmentId, notes);
      
      toast({
        title: "Success",
        description: "Assignment completed successfully",
      });

      await loadCoordinationData();
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
  };

  return {
    coordinationData,
    isLoading,
    loadCoordinationData,
    activateAssignment,
    completeAssignment
  };
};
