import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoordinationData, Assignment, MultiRefereeCoordinationProps } from './coordination/types';
import { WorkflowModeConfig, RefereeWorkflowMode } from '../workflows/types';
import { WORKFLOW_MODES } from '../workflows/constants';
import NoMatchSelected from './coordination/NoMatchSelected';
import WorkflowModeManager from '../workflows/WorkflowModeManager';
import CoordinationHeader from './coordination/CoordinationHeader';
import InitializationSection from './coordination/InitializationSection';
import ProgressOverview from './coordination/ProgressOverview';
import RoleAssignments from './coordination/RoleAssignments';
import CurrentUserRole from './coordination/CurrentUserRole';
import FinalizationSection from './coordination/FinalizationSection';

const MultiRefereeCoordination = ({ 
  selectedFixtureData, 
  onRoleAssigned 
}: MultiRefereeCoordinationProps) => {
  const [workflowMode, setWorkflowMode] = useState<RefereeWorkflowMode | null>(null);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowModeConfig | null>(null);
  const [coordinationData, setCoordinationData] = useState<CoordinationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  // Load workflow mode and coordination status
  useEffect(() => {
    if (selectedFixtureData?.id) {
      loadWorkflowAndCoordination();
    }
  }, [selectedFixtureData?.id]);

  const loadWorkflowAndCoordination = async () => {
    if (!selectedFixtureData?.id) return;

    try {
      setIsLoading(true);
      
      // Check for existing workflow configuration
      // For now, we'll default to multi-referee mode to maintain compatibility
      // In a full implementation, this would check a workflow_configurations table
      
      const { data, error } = await supabase.rpc('get_match_coordination_status', {
        p_fixture_id: selectedFixtureData.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        // Existing coordination found - assume multi-referee mode
        setWorkflowMode(WORKFLOW_MODES.MULTI_REFEREE);
        loadCoordinationStatus();
      } else {
        // No coordination found - show workflow selector
        setWorkflowMode(null);
        setCoordinationData(null);
      }
    } catch (error) {
      console.error('Error loading workflow and coordination:', error);
      toast({
        title: "Error",
        description: "Failed to load coordination status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCoordinationStatus = async () => {
    if (!selectedFixtureData?.id) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('get_match_coordination_status', {
        p_fixture_id: selectedFixtureData.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const coordinationInfo = data[0];
        
        // Parse assignments from JSON to Assignment array with proper type casting
        const assignments = Array.isArray(coordinationInfo.assignments) 
          ? (coordinationInfo.assignments as unknown) as Assignment[]
          : [];

        const parsedData: CoordinationData = {
          coordination_id: coordinationInfo.coordination_id,
          fixture_id: coordinationInfo.fixture_id,
          status: coordinationInfo.status,
          assignments: assignments,
          completion_summary: coordinationInfo.completion_summary,
          ready_for_review: coordinationInfo.ready_for_review
        };

        setCoordinationData(parsedData);
        
        // Check if current user has an assignment
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          const userAssignment = assignments.find(
            (a: Assignment) => a.referee_id === user.data.user?.id
          );
          if (userAssignment) {
            setCurrentUserRole(userAssignment.assigned_role);
          }
        }
      }
    } catch (error) {
      console.error('Error loading coordination status:', error);
      toast({
        title: "Error",
        description: "Failed to load coordination status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkflowConfigured = async (config: WorkflowModeConfig) => {
    console.log('🎯 Workflow configured:', config);
    
    setWorkflowConfig(config);
    setWorkflowMode(config.mode);
    
    // For multi-referee mode, initialize coordination
    if (config.mode === WORKFLOW_MODES.MULTI_REFEREE) {
      await initializeCoordination();
    }
    
    // For two-referees mode, we would initialize a different coordination system
    // This would be implemented in a future iteration
  };

  const initializeCoordination = async () => {
    if (!selectedFixtureData?.id) return;

    try {
      setIsLoading(true);

      // Get current user first
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      // Create match coordination
      const { data: coordination, error: coordError } = await supabase
        .from('match_coordination')
        .insert({
          fixture_id: selectedFixtureData.id,
          coordinator_referee_id: userData.user.id
        })
        .select()
        .single();

      if (coordError) throw coordError;

      // Create initial assignments (will be assigned to referees later)
      const roles = ['score_goals', 'cards_discipline', 'time_tracking', 'coordination'];
      const assignments = roles.map(role => ({
        match_coordination_id: coordination.id,
        assigned_role: role,
        referee_id: userData.user.id // Temporary, will be reassigned
      }));

      const { error: assignError } = await supabase
        .from('referee_assignments')
        .insert(assignments);

      if (assignError) throw assignError;

      toast({
        title: "Success",
        description: "Match coordination initialized successfully",
      });

      await loadCoordinationStatus();
    } catch (error) {
      console.error('Error initializing coordination:', error);
      toast({
        title: "Error",
        description: "Failed to initialize coordination",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignRole = async (role: string) => {
    if (!coordinationData) return;

    try {
      setIsLoading(true);
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Update assignment with current user
      const { error } = await supabase
        .from('referee_assignments')
        .update({
          referee_id: user.data.user.id,
          status: 'in_progress'
        })
        .eq('match_coordination_id', coordinationData.coordination_id)
        .eq('assigned_role', role);

      if (error) throw error;

      // Log event
      await supabase.from('coordination_events').insert({
        match_coordination_id: coordinationData.coordination_id,
        event_type: 'task_started',
        referee_id: user.data.user.id,
        event_data: { assigned_role: role }
      });

      setCurrentUserRole(role);
      
      if (onRoleAssigned) {
        onRoleAssigned(role);
      }

      toast({
        title: "Success",
        description: `You've been assigned to handle ${role.replace('_', ' ')}`,
      });

      await loadCoordinationStatus();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async () => {
    if (!coordinationData || !currentUserRole) return;

    try {
      setIsLoading(true);
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Update assignment as completed
      const { error } = await supabase
        .from('referee_assignments')
        .update({
          status: 'completed',
          completion_timestamp: new Date().toISOString()
        })
        .eq('match_coordination_id', coordinationData.coordination_id)
        .eq('referee_id', user.data.user.id);

      if (error) throw error;

      // Log completion event
      await supabase.from('coordination_events').insert({
        match_coordination_id: coordinationData.coordination_id,
        event_type: 'task_completed',
        referee_id: user.data.user.id,
        event_data: { completed_role: currentUserRole }
      });

      toast({
        title: "Success",
        description: `Task completed successfully`,
      });

      await loadCoordinationStatus();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeMatch = async () => {
    if (!coordinationData) return;

    try {
      setIsLoading(true);

      // Get current user first
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('finalize_match_coordination', {
        p_coordination_id: coordinationData.coordination_id,
        p_final_review_data: {
          finalized_by: userData.user.id,
          finalized_at: new Date().toISOString()
        }
      });

      if (error) throw error;

      // Handle the response properly as JSON
      const result = data as { success: boolean; error?: string };
      if (result.success) {
        toast({
          title: "Success",
          description: "Match has been finalized successfully",
        });
        await loadCoordinationStatus();
      } else {
        throw new Error(result.error || 'Failed to finalize match');
      }
    } catch (error) {
      console.error('Error finalizing match:', error);
      toast({
        title: "Error",
        description: "Failed to finalize match",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedFixtureData) {
    return <NoMatchSelected />;
  }

  // Show workflow mode selector if no mode is selected
  if (!workflowMode) {
    return (
      <WorkflowModeManager
        selectedFixtureData={selectedFixtureData}
        onWorkflowConfigured={handleWorkflowConfigured}
      />
    );
  }

  // Handle Two Referees Mode (simplified workflow)
  if (workflowMode === WORKFLOW_MODES.TWO_REFEREES) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Two Referees Mode Active</h3>
          <p className="text-muted-foreground">
            Team-based referee coordination is now active for this match.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle Multi-Referee Mode (existing full coordination system)
  const completedTasks = coordinationData?.assignments.filter(a => a.status === 'completed').length || 0;
  const totalTasks = coordinationData?.assignments.length || 4;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <Card>
      <CoordinationHeader 
        selectedFixtureData={selectedFixtureData}
        coordinationData={coordinationData}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
      />

      <CardContent className="space-y-6">
        {!coordinationData ? (
          <InitializationSection 
            onInitialize={initializeCoordination}
            isLoading={isLoading}
          />
        ) : (
          <>
            <ProgressOverview progressPercentage={progressPercentage} />

            <RoleAssignments
              coordinationData={coordinationData}
              currentUserRole={currentUserRole}
              onAssignRole={assignRole}
              onCompleteTask={completeTask}
              isLoading={isLoading}
            />

            {currentUserRole && (
              <CurrentUserRole currentUserRole={currentUserRole} />
            )}

            {coordinationData.ready_for_review && coordinationData.status !== 'completed' && (
              <FinalizationSection 
                onFinalize={finalizeMatch}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiRefereeCoordination;
