
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RefereeWorkflowMode, WorkflowModeConfig } from './types';
import { WORKFLOW_MODES } from './constants';
import WorkflowModeSelector from './WorkflowModeSelector';
import TwoRefereesSelfAssignment from './TwoRefereesSelfAssignment';
import MultiRefereeConfiguration from './MultiRefereeConfiguration';

interface WorkflowModeManagerProps {
  selectedFixtureData: any;
  onWorkflowConfigured: (config: WorkflowModeConfig) => void;
}

const WorkflowModeManager = ({ 
  selectedFixtureData, 
  onWorkflowConfigured 
}: WorkflowModeManagerProps) => {
  const [selectedMode, setSelectedMode] = useState<RefereeWorkflowMode | null>(null);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Reset when fixture changes
  useEffect(() => {
    setSelectedMode(null);
    setShowConfiguration(false);
  }, [selectedFixtureData?.id]);

  const handleModeSelect = (mode: RefereeWorkflowMode) => {
    setSelectedMode(mode);
    
    if (mode === WORKFLOW_MODES.TWO_REFEREES) {
      // For Two Referees Mode, go directly to self-assignment
      setShowConfiguration(true);
    } else if (mode === WORKFLOW_MODES.MULTI_REFEREE) {
      // For Multi-Referee Mode, show the configuration screen
      setShowConfiguration(true);
    }
  };

  const handleTwoRefereesAssignment = async () => {
    setIsLoading(true);
    try {
      // Create a minimal workflow config for Two Referees Mode
      const workflowConfig: WorkflowModeConfig = {
        mode: WORKFLOW_MODES.TWO_REFEREES,
        fixtureId: selectedFixtureData.id,
        userAssignments: [],
        allAssignments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onWorkflowConfigured(workflowConfig);

      toast({
        title: "Success",
        description: "Two Referees Mode assignment completed",
      });

      setShowConfiguration(false);
    } catch (error) {
      console.error('Error in two referees assignment:', error);
      toast({
        title: "Error",
        description: "Failed to complete assignment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiRefereeConfigSave = async (config: any) => {
    setIsLoading(true);
    try {
      const workflowConfig: WorkflowModeConfig = {
        mode: WORKFLOW_MODES.MULTI_REFEREE,
        fixtureId: selectedFixtureData.id,
        userAssignments: [],
        allAssignments: [],
        multiRefereeConfig: config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onWorkflowConfigured(workflowConfig);

      toast({
        title: "Success", 
        description: "Multi-Referee Mode configured successfully",
      });

      setShowConfiguration(false);
    } catch (error) {
      console.error('Error configuring multi-referee mode:', error);
      toast({
        title: "Error",
        description: "Failed to configure multi-referee mode",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigCancel = () => {
    setShowConfiguration(false);
    setSelectedMode(null);
  };

  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Match Selected</h3>
            <p className="text-muted-foreground">Select a fixture to configure referee workflow</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showConfiguration && selectedMode) {
    if (selectedMode === WORKFLOW_MODES.TWO_REFEREES) {
      return (
        <TwoRefereesSelfAssignment
          selectedFixtureData={selectedFixtureData}
          onAssignmentComplete={handleTwoRefereesAssignment}
        />
      );
    }

    if (selectedMode === WORKFLOW_MODES.MULTI_REFEREE) {
      return (
        <MultiRefereeConfiguration
          onSave={handleMultiRefereeConfigSave}
          onCancel={handleConfigCancel}
        />
      );
    }
  }

  return (
    <WorkflowModeSelector
      selectedMode={selectedMode}
      onModeSelect={handleModeSelect}
      disabled={isLoading}
    />
  );
};

export default WorkflowModeManager;
