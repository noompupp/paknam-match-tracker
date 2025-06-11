
import { supabase } from '@/integrations/supabase/client';

export interface CoordinationData {
  fixture_id: number;
  workflow_mode: 'two_referees' | 'multi_referee';
  assignments: AssignmentData[];
  user_assignments: AssignmentData[];
  completion_status: CompletionStatus;
}

export interface AssignmentData {
  assignment_id: string;
  referee_id?: string;
  assigned_role: string;
  team_assignment: string | null;
  responsibilities: string[];
  status: 'assigned' | 'active' | 'completed';
  completion_timestamp?: string;
  notes?: string;
  assigned_at?: string;
}

export interface CompletionStatus {
  total_assignments: number;
  completed_assignments: number;
  in_progress_assignments: number;
  pending_assignments: number;
}

export const coordinationService = {
  async getCoordinationData(fixtureId: number): Promise<CoordinationData | null> {
    console.log('🎯 Getting coordination data for fixture:', fixtureId);
    
    const { data, error } = await supabase.rpc('get_coordination_with_assignments', {
      p_fixture_id: fixtureId
    });

    if (error) {
      console.error('❌ Error getting coordination data:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ No coordination data found for fixture:', fixtureId);
      return null;
    }

    const coordinationInfo = data[0];
    console.log('✅ Coordination data retrieved:', coordinationInfo);
    
    return {
      fixture_id: coordinationInfo.fixture_id,
      workflow_mode: coordinationInfo.workflow_mode as 'two_referees' | 'multi_referee',
      assignments: (coordinationInfo.assignments as any[]) || [],
      user_assignments: (coordinationInfo.user_assignments as any[]) || [],
      completion_status: (coordinationInfo.completion_status as CompletionStatus) || {
        total_assignments: 0,
        completed_assignments: 0,
        in_progress_assignments: 0,
        pending_assignments: 0
      }
    };
  },

  async completeAssignment(assignmentId: string, notes?: string): Promise<any> {
    console.log('🎯 Completing assignment:', { assignmentId, notes });

    const { data, error } = await supabase.rpc('complete_referee_assignment', {
      p_assignment_id: assignmentId,
      p_completion_notes: notes
    });

    if (error) {
      console.error('❌ Error completing assignment:', error);
      throw error;
    }

    console.log('✅ Assignment completed:', data);
    return data;
  },

  async activateAssignment(assignmentId: string): Promise<void> {
    console.log('🎯 Activating assignment:', assignmentId);

    const { error } = await supabase
      .from('match_referee_assignments')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId);

    if (error) {
      console.error('❌ Error activating assignment:', error);
      throw error;
    }

    console.log('✅ Assignment activated successfully');
  }
};
