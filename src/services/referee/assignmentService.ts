
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
  async checkUserRole(): Promise<{ isAuthenticated: boolean; role: string | null; canAccess: boolean }> {
    try {
      console.log('🔐 Checking user authentication and role...');
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.log('❌ User not authenticated:', userError?.message);
        return { isAuthenticated: false, role: null, canAccess: false };
      }

      console.log('✅ User authenticated:', userData.user.id);

      // Check user role
      const { data: roleData, error: roleError } = await supabase
        .from('auth_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (roleError) {
        console.error('❌ Error checking user role:', roleError);
        return { isAuthenticated: true, role: null, canAccess: false };
      }

      const userRole = roleData?.role || 'viewer';
      const canAccess = ['admin', 'referee'].includes(userRole);
      
      console.log(`✅ User role: ${userRole}, Can access: ${canAccess}`);
      
      return { isAuthenticated: true, role: userRole, canAccess };
    } catch (error) {
      console.error('❌ Error in checkUserRole:', error);
      return { isAuthenticated: false, role: null, canAccess: false };
    }
  },

  async getUserAssignments(fixtureId: number): Promise<RefereeAssignment[]> {
    console.log('🎯 Getting user assignments for fixture:', fixtureId);
    
    try {
      // Check user access first
      const { canAccess } = await this.checkUserRole();
      if (!canAccess) {
        console.log('🚫 User does not have access to assignments');
        return [];
      }

      const { data, error } = await supabase.rpc('get_user_fixture_assignments', {
        p_fixture_id: fixtureId
      });

      if (error) {
        console.error('❌ Error getting user assignments:', error);
        throw new Error(`Failed to get user assignments: ${error.message}`);
      }

      console.log('✅ User assignments retrieved:', data);
      return (data || []).map((assignment: any) => ({
        ...assignment,
        status: assignment.status as 'assigned' | 'active' | 'completed',
        workflow_mode: assignment.workflow_mode as 'two_referees' | 'multi_referee'
      }));
    } catch (error) {
      console.error('❌ Error in getUserAssignments:', error);
      throw error;
    }
  },

  async getAllFixtureAssignments(fixtureId: number): Promise<FixtureAssignment[]> {
    console.log('🎯 Getting all assignments for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase.rpc('get_fixture_all_assignments', {
        p_fixture_id: fixtureId
      });

      if (error) {
        console.error('❌ Error getting fixture assignments:', error);
        throw new Error(`Failed to get fixture assignments: ${error.message}`);
      }

      console.log('✅ Fixture assignments retrieved:', data);
      return (data || []).map((assignment: any) => ({
        ...assignment,
        status: assignment.status as 'assigned' | 'active' | 'completed',
        workflow_mode: assignment.workflow_mode as 'two_referees' | 'multi_referee'
      }));
    } catch (error) {
      console.error('❌ Error in getAllFixtureAssignments:', error);
      throw error;
    }
  },

  async createFallbackAssignments(
    fixtureId: number,
    workflowMode: 'two_referees' | 'multi_referee'
  ): Promise<void> {
    console.log('🔄 Creating fallback assignments for fixture:', fixtureId);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated for fallback assignment creation');
      }

      if (workflowMode === 'two_referees') {
        // Create home and away team assignments
        const assignments = [
          {
            fixture_id: fixtureId,
            referee_id: '00000000-0000-0000-0000-000000000000',
            workflow_mode: workflowMode,
            assigned_role: 'home_team',
            team_assignment: 'home',
            responsibilities: ['score_goals', 'cards_discipline', 'time_tracking'],
            status: 'assigned',
            assigned_by: userData.user.id
          },
          {
            fixture_id: fixtureId,
            referee_id: '00000000-0000-0000-0000-000000000000',
            workflow_mode: workflowMode,
            assigned_role: 'away_team',
            team_assignment: 'away',
            responsibilities: ['score_goals', 'cards_discipline', 'time_tracking'],
            status: 'assigned',
            assigned_by: userData.user.id
          }
        ];

        for (const assignment of assignments) {
          const { error } = await supabase
            .from('match_referee_assignments')
            .insert(assignment);
          
          if (error) {
            console.error('❌ Error creating fallback assignment:', error);
          }
        }
      } else if (workflowMode === 'multi_referee') {
        // Create specialized role assignments
        const assignments = [
          {
            fixture_id: fixtureId,
            referee_id: '00000000-0000-0000-0000-000000000000',
            workflow_mode: workflowMode,
            assigned_role: 'score_goals',
            team_assignment: null,
            responsibilities: ['score_goals'],
            status: 'assigned',
            assigned_by: userData.user.id
          },
          {
            fixture_id: fixtureId,
            referee_id: '00000000-0000-0000-0000-000000000000',
            workflow_mode: workflowMode,
            assigned_role: 'cards_discipline',
            team_assignment: null,
            responsibilities: ['cards_discipline'],
            status: 'assigned',
            assigned_by: userData.user.id
          },
          {
            fixture_id: fixtureId,
            referee_id: '00000000-0000-0000-0000-000000000000',
            workflow_mode: workflowMode,
            assigned_role: 'time_tracking',
            team_assignment: null,
            responsibilities: ['time_tracking'],
            status: 'assigned',
            assigned_by: userData.user.id
          },
          {
            fixture_id: fixtureId,
            referee_id: '00000000-0000-0000-0000-000000000000',
            workflow_mode: workflowMode,
            assigned_role: 'coordination',
            team_assignment: null,
            responsibilities: ['coordination'],
            status: 'assigned',
            assigned_by: userData.user.id
          }
        ];

        for (const assignment of assignments) {
          const { error } = await supabase
            .from('match_referee_assignments')
            .insert(assignment);
          
          if (error) {
            console.error('❌ Error creating fallback assignment:', error);
          }
        }
      }

      console.log('✅ Fallback assignments created successfully');
    } catch (error) {
      console.error('❌ Error in createFallbackAssignments:', error);
      throw error;
    }
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

    try {
      // Check user access first
      const { canAccess } = await this.checkUserRole();
      if (!canAccess) {
        throw new Error('User does not have permission to assign roles');
      }

      const { data, error } = await supabase.rpc('assign_referee_to_role', {
        p_fixture_id: fixtureId,
        p_assigned_role: assignedRole,
        p_workflow_mode: workflowMode,
        p_team_assignment: teamAssignment,
        p_responsibilities: responsibilities
      });

      if (error) {
        console.error('❌ Error assigning referee to role:', error);
        throw new Error(`Failed to assign referee to role: ${error.message}`);
      }

      console.log('✅ Referee assigned successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in assignUserToRole:', error);
      throw error;
    }
  },

  async getWorkflowConfig(fixtureId: number): Promise<WorkflowConfig | null> {
    console.log('🎯 Getting workflow config for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase
        .from('match_workflow_config')
        .select('*')
        .eq('fixture_id', fixtureId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error getting workflow config:', error);
        throw new Error(`Failed to get workflow config: ${error.message}`);
      }

      console.log('✅ Workflow config retrieved:', data);
      
      if (!data) return null;
      
      return {
        ...data,
        workflow_mode: data.workflow_mode as 'two_referees' | 'multi_referee'
      };
    } catch (error) {
      console.error('❌ Error in getWorkflowConfig:', error);
      throw error;
    }
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

    try {
      // Check user access first
      const { canAccess, isAuthenticated } = await this.checkUserRole();
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      if (!canAccess) {
        throw new Error('User does not have permission to configure workflow');
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // First, set the workflow config
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
        throw new Error(`Failed to set workflow config: ${error.message}`);
      }

      console.log('✅ Workflow config set successfully:', data);

      // Try to initialize referee assignments using the database function
      try {
        const { data: initData, error: initError } = await supabase.rpc('initialize_referee_assignments', {
          p_fixture_id: fixtureId,
          p_workflow_mode: workflowMode
        });

        if (initError) {
          console.warn('⚠️ Database function failed, trying fallback assignment creation:', initError);
          await this.createFallbackAssignments(fixtureId, workflowMode);
        } else {
          console.log('✅ Referee assignments initialized via database function:', initData);
        }
      } catch (initError) {
        console.warn('⚠️ Initialization failed, using fallback method:', initError);
        await this.createFallbackAssignments(fixtureId, workflowMode);
      }
      
      return {
        ...data,
        workflow_mode: data.workflow_mode as 'two_referees' | 'multi_referee'
      };
    } catch (error) {
      console.error('❌ Error in setWorkflowConfig:', error);
      throw error;
    }
  },

  async updateAssignmentStatus(
    assignmentId: string,
    status: 'assigned' | 'active' | 'completed'
  ): Promise<void> {
    console.log('🎯 Updating assignment status:', { assignmentId, status });

    try {
      // Check user access first
      const { canAccess } = await this.checkUserRole();
      if (!canAccess) {
        throw new Error('User does not have permission to update assignment status');
      }

      const { error } = await supabase
        .from('match_referee_assignments')
        .update({ status })
        .eq('id', assignmentId);

      if (error) {
        console.error('❌ Error updating assignment status:', error);
        throw new Error(`Failed to update assignment status: ${error.message}`);
      }

      console.log('✅ Assignment status updated successfully');
    } catch (error) {
      console.error('❌ Error in updateAssignmentStatus:', error);
      throw error;
    }
  },

  async initializeRefereeAssignments(
    fixtureId: number,
    workflowMode: 'two_referees' | 'multi_referee'
  ): Promise<any> {
    console.log('🎯 Initializing referee assignments:', { fixtureId, workflowMode });

    try {
      // Check user access first
      const { canAccess } = await this.checkUserRole();
      if (!canAccess) {
        throw new Error('User does not have permission to initialize assignments');
      }

      const { data, error } = await supabase.rpc('initialize_referee_assignments', {
        p_fixture_id: fixtureId,
        p_workflow_mode: workflowMode
      });

      if (error) {
        console.error('❌ Error initializing referee assignments:', error);
        // Try fallback method
        console.log('🔄 Attempting fallback assignment creation...');
        await this.createFallbackAssignments(fixtureId, workflowMode);
        return { success: true, method: 'fallback' };
      }

      console.log('✅ Referee assignments initialized successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in initializeRefereeAssignments:', error);
      throw error;
    }
  }
};
