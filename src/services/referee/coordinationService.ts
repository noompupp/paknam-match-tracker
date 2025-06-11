
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
  async getCoordinationData(fixtureId: number): Promise<CoordinationData | null> {
    console.log('🎯 CoordinationService: Getting coordination data for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase
        .rpc('get_coordination_with_assignments', { p_fixture_id: fixtureId });

      if (error) {
        console.error('❌ CoordinationService: Error fetching coordination data:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ CoordinationService: No coordination data found');
        return null;
      }

      const result = data[0];
      console.log('✅ CoordinationService: Coordination data retrieved:', result);
      
      // Type-safe parsing of the database function result
      const workflowMode = typeof result.workflow_mode === 'string' ? 
        (result.workflow_mode as 'two_referees' | 'multi_referee') : 'two_referees';
      
      // Use unknown as intermediate type for proper type conversion
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
      throw error;
    }
  },

  async activateAssignment(assignmentId: string): Promise<void> {
    console.log('🔄 CoordinationService: Activating assignment:', assignmentId);
    
    try {
      const { error } = await supabase
        .from('match_referee_assignments')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .eq('referee_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('❌ CoordinationService: Error activating assignment:', error);
        throw error;
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
      const { data, error } = await supabase
        .rpc('complete_referee_assignment', {
          p_assignment_id: assignmentId,
          p_completion_notes: notes
        });

      if (error) {
        console.error('❌ CoordinationService: Error completing assignment:', error);
        throw error;
      }

      // Type-safe handling of the database function result
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
