
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { coordinationService, type CoordinationData } from '@/services/referee/coordinationService';

export const useCoordinationManager = (fixtureId: number | null) => {
  const [coordinationData, setCoordinationData] = useState<CoordinationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCoordinationData = async () => {
    if (!fixtureId) return;

    setIsLoading(true);
    try {
      const data = await coordinationService.getCoordinationData(fixtureId);
      setCoordinationData(data);
    } catch (error) {
      console.error('Error fetching coordination data:', error);
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
    setIsLoading(true);
    try {
      await coordinationService.activateAssignment(assignmentId);
      await fetchCoordinationData(); // Refresh data
      toast({
        title: "Success",
        description: "Assignment activated successfully"
      });
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
    setIsLoading(true);
    try {
      await coordinationService.completeAssignment(assignmentId, notes);
      await fetchCoordinationData(); // Refresh data
      toast({
        title: "Success",
        description: "Assignment completed successfully"
      });
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

  useEffect(() => {
    fetchCoordinationData();
  }, [fixtureId]);

  return {
    coordinationData,
    isLoading,
    activateAssignment,
    completeAssignment,
    refreshData: fetchCoordinationData
  };
};
