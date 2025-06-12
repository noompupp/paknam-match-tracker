
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      
      // Check for existing workflow config first
      const workflowConfig = await refereeAssignmentService.getWorkflowConfig(selectedFixtureData.id);
      
      // Get assignments to understand the current state
      const [userAssignments, allAssignments] = await Promise.all([
        refereeAssignmentService.getUserAssignments(selectedFixtureData.id),
        refereeAssignmentService.getAllFixtureAssignments(selectedFixtureData.id)
      ]);

      // Determine workflow mode based on assignments or config
      let workflowMode: 'two_referees' | 'multi_referee' = 'two_referees';
      
      if (workflowConfig) {
        workflowMode = workflowConfig.workflow_mode;
      } else if (allAssignments.length > 0) {
        // Detect Two Referees Mode by checking for team-based assignments
        const hasTeamAssignments = allAssignments.some(assignment => 
          assignment.assigned_role === 'home_team' || assignment.assigned_role === 'away_team'
        );
        workflowMode = hasTeamAssignments ? 'two_referees' : 'multi_referee';
      }

      if (workflowConfig || allAssignments.length > 0) {
        const enhancedConfig: WorkflowModeConfig = {
          mode: workflowMode,
          fixtureId: selectedFixtureData.id,
          userAssignments,
          allAssignments,
          createdAt: workflowConfig?.created_at || new Date().toISOString(),
          updatedAt: workflowConfig?.updated_at || new Date().toISOString()
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
    const isTwoRefereesMode = existingConfig.mode === WORKFLOW_MODES.TWO_REFEREES;
    const assignmentCount = existingConfig.allAssignments.length;
    const userAssignmentCount = existingConfig.userAssignments.length;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Workflow Configured</span>
            <Badge variant="outline">
              {isTwoRefereesMode ? 'Two Referees' : 'Multi-Referee'} Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This match has a {isTwoRefereesMode ? 'Two Referees' : 'Multi-Referee'} workflow configured.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Your Assignments:</span> {userAssignmentCount}
              </div>
              <div>
                <span className="font-medium">Total Assignments:</span> {assignmentCount}
              </div>
            </div>

            {isTwoRefereesMode && assignmentCount < 2 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/10 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Waiting for both referees to self-assign to their team roles.
                </p>
              </div>
            )}
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
