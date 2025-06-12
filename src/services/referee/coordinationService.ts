
import { supabase } from '@/integrations/supabase/client';

export interface AssignmentData {
  assignment_id: string;
  assigned_role: string;
  team_assignment?: string;
  responsibilities: string[];
  status: 'assigned' | 'active' | 'completed';
  completion_timestamp?: string;
  notes?: string;
  referee_id?: string;
  assigned_at?: string;
}

export interface CoordinationData {
  fixture_id: number;
  workflow_mode: 'two_referees' | 'multi_referee';
  assignments: AssignmentData[];
  user_assignments: AssignmentData[];
  completion_status: {
    total_assignments: number;
    completed_assignments: number;
    in_progress_assignments: number;
    pending_assignments: number;
  };
}

export const coordinationService = {
  async checkUserAccess(): Promise<{ canAccess: boolean; userRole: string | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { canAccess: false, userRole: null };
      }

      const { data: roleData } = await supabase
        .from('auth_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      const userRole = roleData?.role || 'viewer';
      const canAccess = ['admin', 'referee'].includes(userRole);
      
      return { canAccess, userRole };
    } catch (error) {
      console.error('❌ Error checking user access:', error);
      return { canAccess: false, userRole: null };
    }
  },

  async getCoordinationData(fixtureId: number): Promise<CoordinationData | null> {
    console.log('🎯 CoordinationService: Getting coordination data for fixture:', fixtureId);
    
    try {
      // Check user access first
      const { canAccess, userRole } = await this.checkUserAccess();
      console.log(`🔐 User access check: canAccess=${canAccess}, role=${userRole}`);
      
      if (!canAccess) {
        console.log('🚫 User does not have access to coordination data');
        return null;
      }

      // Try the RPC function first
      const { data, error } = await supabase
        .rpc('get_coordination_with_assignments', { p_fixture_id: fixtureId });

      if (error) {
        console.error('❌ CoordinationService: RPC function failed:', error);
        // Fall back to direct table queries
        return await this.getCoordinationDataFallback(fixtureId);
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ CoordinationService: No coordination data from RPC, trying fallback');
        return await this.getCoordinationDataFallback(fixtureId);
      }

      const result = data[0];
      console.log('✅ CoordinationService: Coordination data retrieved via RPC:', result);
      
      // Type-safe parsing of the database function result
      const workflowMode = typeof result.workflow_mode === 'string' ? 
        (result.workflow_mode as 'two_referees' | 'multi_referee') : 'two_referees';
      
      const assignments = Array.isArray(result.assignments) ? 
        (result.assignments as unknown) as AssignmentData[] : [];
      
      const userAssignments = Array.isArray(result.user_assignments) ? 
        (result.user_assignments as unknown) as AssignmentData[] : [];
      
      const completionStatus = result.completion_status && typeof result.completion_status === 'object' ? 
        result.completion_status as {
          total_assignments: number;
          completed_assignments: number;
          in_progress_assignments: number;
          pending_assignments: number;
        } : {
          total_assignments: 0,
          completed_assignments: 0,
          in_progress_assignments: 0,
          pending_assignments: 0
        };
      
      return {
        fixture_id: result.fixture_id,
        workflow_mode: workflowMode,
        assignments,
        user_assignments: userAssignments,
        completion_status: completionStatus
      };
    } catch (error) {
      console.error('❌ CoordinationService: Error in getCoordinationData:', error);
      
      // Try fallback method
      try {
        console.log('🔄 Attempting fallback coordination data retrieval...');
        return await this.getCoordinationDataFallback(fixtureId);
      } catch (fallbackError) {
        console.error('❌ CoordinationService: Fallback also failed:', fallbackError);
        throw new Error(`Failed to load coordination data: ${error}`);
      }
    }
  },

  async getCoordinationDataFallback(fixtureId: number): Promise<CoordinationData | null> {
    console.log('🔄 CoordinationService: Using fallback method for fixture:', fixtureId);
    
    try {
      // Get workflow config
      const { data: configData } = await supabase
        .from('match_workflow_config')
        .select('workflow_mode')
        .eq('fixture_id', fixtureId)
        .maybeSingle();

      const workflowMode = (configData?.workflow_mode as 'two_referees' | 'multi_referee') || 'two_referees';

      // Get all assignments
      const { data: allAssignments, error: assignmentsError } = await supabase
        .from('match_referee_assignments')
        .select('*')
        .eq('fixture_id', fixtureId);

      if (assignmentsError) {
        console.error('❌ Error getting assignments:', assignmentsError);
        throw assignmentsError;
      }

      // Get user assignments
      const { data: userData } = await supabase.auth.getUser();
      const userAssignments = userData.user ? 
        (allAssignments || []).filter(a => a.referee_id === userData.user!.id) : [];

      // Calculate completion status
      const totalAssignments = (allAssignments || []).length;
      const completedAssignments = (allAssignments || []).filter(a => a.status === 'completed').length;
      const inProgressAssignments = (allAssignments || []).filter(a => a.status === 'active').length;
      const pendingAssignments = (allAssignments || []).filter(a => a.status === 'assigned').length;

      const coordinationData: CoordinationData = {
        fixture_id: fixtureId,
        workflow_mode: workflowMode,
        assignments: (allAssignments || []).map(a => ({
          assignment_id: a.id,
          assigned_role: a.assigned_role,
          team_assignment: a.team_assignment,
          responsibilities: a.responsibilities || [],
          status: a.status as 'assigned' | 'active' | 'completed',
          completion_timestamp: a.completion_timestamp,
          notes: a.notes,
          referee_id: a.referee_id,
          assigned_at: a.assigned_at
        })),
        user_assignments: userAssignments.map(a => ({
          assignment_id: a.id,
          assigned_role: a.assigned_role,
          team_assignment: a.team_assignment,
          responsibilities: a.responsibilities || [],
          status: a.status as 'assigned' | 'active' | 'completed',
          completion_timestamp: a.completion_timestamp,
          notes: a.notes
        })),
        completion_status: {
          total_assignments: totalAssignments,
          completed_assignments: completedAssignments,
          in_progress_assignments: inProgressAssignments,
          pending_assignments: pendingAssignments
        }
      };

      console.log('✅ CoordinationService: Fallback data retrieved:', coordinationData);
      return coordinationData;
    } catch (error) {
      console.error('❌ CoordinationService: Error in fallback method:', error);
      throw error;
    }
  },

  async activateAssignment(assignmentId: string): Promise<void> {
    console.log('🔄 CoordinationService: Activating assignment:', assignmentId);
    
    try {
      const { canAccess } = await this.checkUserAccess();
      if (!canAccess) {
        throw new Error('User does not have permission to activate assignments');
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('match_referee_assignments')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .eq('referee_id', userData.user.id);

      if (error) {
        console.error('❌ CoordinationService: Error activating assignment:', error);
        throw new Error(`Failed to activate assignment: ${error.message}`);
      }

      console.log('✅ CoordinationService: Assignment activated successfully');
    } catch (error) {
      console.error('❌ CoordinationService: Error in activateAssignment:', error);
      throw error;
    }
  },

  async completeAssignment(assignmentId: string, notes?: string): Promise<void> {
    console.log('✅ CoordinationService: Completing assignment:', assignmentId);
    
    try {
      const { canAccess } = await this.checkUserAccess();
      if (!canAccess) {
        throw new Error('User does not have permission to complete assignments');
      }

      const { data, error } = await supabase
        .rpc('complete_referee_assignment', {
          p_assignment_id: assignmentId,
          p_completion_notes: notes
        });

      if (error) {
        console.error('❌ CoordinationService: Error completing assignment:', error);
        throw new Error(`Failed to complete assignment: ${error.message}`);
      }

      const result = data as { success?: boolean; error?: string } | null;
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to complete assignment');
      }

      console.log('✅ CoordinationService: Assignment completed successfully');
    } catch (error) {
      console.error('❌ CoordinationService: Error in completeAssignment:', error);
      throw error;
    }
  }
};
