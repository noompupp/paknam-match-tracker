
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { refereeAssignmentService } from '@/services/referee/assignmentService';
import { WORKFLOW_MODES } from './constants';
import { WorkflowModeConfig } from './types';
import WorkflowModeManager from './WorkflowModeManager';

interface EnhancedWorkflowModeManagerProps {
  selectedFixtureData: any;
  onWorkflowConfigured: (config: any) => void;
}

const EnhancedWorkflowModeManager = ({ 
  selectedFixtureData, 
  onWorkflowConfigured 
}: EnhancedWorkflowModeManagerProps) => {
  const [existingConfig, setExistingConfig] = useState<WorkflowModeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedFixtureData?.id) {
      checkExistingWorkflow();
    }
  }, [selectedFixtureData?.id]);

  const checkExistingWorkflow = async () => {
    if (!selectedFixtureData?.id) return;

    try {
      setIsLoading(true);
      
      // Check for existing workflow config
      const workflowConfig = await refereeAssignmentService.getWorkflowConfig(selectedFixtureData.id);
      
      if (workflowConfig) {
        // Get user assignments and all assignments
        const [userAssignments, allAssignments] = await Promise.all([
          refereeAssignmentService.getUserAssignments(selectedFixtureData.id),
          refereeAssignmentService.getAllFixtureAssignments(selectedFixtureData.id)
        ]);

        const enhancedConfig: WorkflowModeConfig = {
          mode: workflowConfig.workflow_mode,
          fixtureId: workflowConfig.fixture_id,
          userAssignments,
          allAssignments,
          createdAt: workflowConfig.created_at,
          updatedAt: workflowConfig.updated_at
        };

        setExistingConfig(enhancedConfig);
        onWorkflowConfigured(enhancedConfig);
      }
    } catch (error) {
      console.error('Error checking existing workflow:', error);
      // Don't show error toast for missing config - this is expected
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkflowConfigured = async (config: WorkflowModeConfig) => {
    try {
      // Set workflow config in database
      const dbConfig = await refereeAssignmentService.setWorkflowConfig(
        config.fixtureId,
        config.mode,
        { 
          twoRefereesConfig: config.twoRefereesConfig,
          multiRefereeConfig: config.multiRefereeConfig
        }
      );

      // Get updated assignments
      const [userAssignments, allAssignments] = await Promise.all([
        refereeAssignmentService.getUserAssignments(config.fixtureId),
        refereeAssignmentService.getAllFixtureAssignments(config.fixtureId)
      ]);

      const enhancedConfig: WorkflowModeConfig = {
        ...config,
        userAssignments,
        allAssignments,
        createdAt: dbConfig.created_at,
        updatedAt: dbConfig.updated_at
      };

      setExistingConfig(enhancedConfig);
      onWorkflowConfigured(enhancedConfig);

      toast({
        title: "Success",
        description: "Workflow configured successfully",
      });
    } catch (error) {
      console.error('Error saving workflow config:', error);
      toast({
        title: "Error",
        description: "Failed to configure workflow",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p>Loading workflow configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (existingConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Already Configured</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This match already has a {existingConfig.mode === WORKFLOW_MODES.TWO_REFEREES ? 'Two Referees' : 'Multi-Referee'} workflow configured.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User Assignments:</span> {existingConfig.userAssignments.length}
              </div>
              <div>
                <span className="font-medium">Total Assignments:</span> {existingConfig.allAssignments.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <WorkflowModeManager
      selectedFixtureData={selectedFixtureData}
      onWorkflowConfigured={handleWorkflowConfigured}
    />
  );
};

export default EnhancedWorkflowModeManager;
