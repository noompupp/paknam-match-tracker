
import { supabase } from '@/integrations/supabase/client';

export interface RefereeAssignment {
  assignment_id: string;
  assigned_role: string;
  team_assignment: string | null;
  responsibilities: string[];
  status: 'assigned' | 'active' | 'completed';
  workflow_mode: 'two_referees' | 'multi_referee';
}

export interface FixtureAssignment extends RefereeAssignment {
  referee_id: string;
  assigned_at: string;
}

export interface WorkflowConfig {
  id: string;
  fixture_id: number;
  workflow_mode: 'two_referees' | 'multi_referee';
  configured_by: string;
  config_data: any;
  created_at: string;
  updated_at: string;
}

// Enhanced workflow config that includes assignment data
export interface EnhancedWorkflowConfig {
  mode: 'two_referees' | 'multi_referee';
  fixtureId: number;
  userAssignments: RefereeAssignment[];
  allAssignments: FixtureAssignment[];
  createdAt: string;
  updatedAt: string;
}

export const refereeAssignmentService = {
  async getUserAssignments(fixtureId: number): Promise<RefereeAssignment[]> {
    console.log('🎯 Getting user assignments for fixture:', fixtureId);
    
    const { data, error } = await supabase.rpc('get_user_fixture_assignments', {
      p_fixture_id: fixtureId
    });

    if (error) {
      console.error('❌ Error getting user assignments:', error);
      throw error;
    }

    console.log('✅ User assignments retrieved:', data);
    // Type cast the database response to ensure proper TypeScript types
    return (data || []).map((assignment: any) => ({
      ...assignment,
      status: assignment.status as 'assigned' | 'active' | 'completed',
      workflow_mode: assignment.workflow_mode as 'two_referees' | 'multi_referee'
    }));
  },

  async getAllFixtureAssignments(fixtureId: number): Promise<FixtureAssignment[]> {
    console.log('🎯 Getting all assignments for fixture:', fixtureId);
    
    const { data, error } = await supabase.rpc('get_fixture_all_assignments', {
      p_fixture_id: fixtureId
    });

    if (error) {
      console.error('❌ Error getting fixture assignments:', error);
      throw error;
    }

    console.log('✅ Fixture assignments retrieved:', data);
    // Type cast the database response to ensure proper TypeScript types
    return (data || []).map((assignment: any) => ({
      ...assignment,
      status: assignment.status as 'assigned' | 'active' | 'completed',
      workflow_mode: assignment.workflow_mode as 'two_referees' | 'multi_referee'
    }));
  },

  async assignUserToRole(
    fixtureId: number,
    assignedRole: string,
    workflowMode: 'two_referees' | 'multi_referee',
    teamAssignment?: string,
    responsibilities: string[] = []
  ): Promise<any> {
    console.log('🎯 Assigning user to role:', {
      fixtureId,
      assignedRole,
      workflowMode,
      teamAssignment,
      responsibilities
    });

    const { data, error } = await supabase.rpc('assign_referee_to_role', {
      p_fixture_id: fixtureId,
      p_assigned_role: assignedRole,
      p_workflow_mode: workflowMode,
      p_team_assignment: teamAssignment,
      p_responsibilities: responsibilities
    });

    if (error) {
      console.error('❌ Error assigning referee to role:', error);
      throw error;
    }

    console.log('✅ Referee assigned successfully:', data);
    return data;
  },

  async getWorkflowConfig(fixtureId: number): Promise<WorkflowConfig | null> {
    console.log('🎯 Getting workflow config for fixture:', fixtureId);
    
    const { data, error } = await supabase
      .from('match_workflow_config')
      .select('*')
      .eq('fixture_id', fixtureId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error getting workflow config:', error);
      throw error;
    }

    console.log('✅ Workflow config retrieved:', data);
    
    if (!data) return null;
    
    // Type cast the database response to ensure proper TypeScript types
    return {
      ...data,
      workflow_mode: data.workflow_mode as 'two_referees' | 'multi_referee'
    };
  },

  async setWorkflowConfig(
    fixtureId: number,
    workflowMode: 'two_referees' | 'multi_referee',
    configData: any = {}
  ): Promise<WorkflowConfig> {
    console.log('🎯 Setting workflow config:', {
      fixtureId,
      workflowMode,
      configData
    });

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('match_workflow_config')
      .upsert({
        fixture_id: fixtureId,
        workflow_mode: workflowMode,
        configured_by: userData.user.id,
        config_data: configData
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error setting workflow config:', error);
      throw error;
    }

    console.log('✅ Workflow config set successfully:', data);
    
    // Type cast the database response to ensure proper TypeScript types
    return {
      ...data,
      workflow_mode: data.workflow_mode as 'two_referees' | 'multi_referee'
    };
  },

  async updateAssignmentStatus(
    assignmentId: string,
    status: 'assigned' | 'active' | 'completed'
  ): Promise<void> {
    console.log('🎯 Updating assignment status:', { assignmentId, status });

    const { error } = await supabase
      .from('match_referee_assignments')
      .update({ status })
      .eq('id', assignmentId);

    if (error) {
      console.error('❌ Error updating assignment status:', error);
      throw error;
    }

    console.log('✅ Assignment status updated successfully');
  }
};
