
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { refereeAssignmentService } from '@/services/referee/assignmentService';

interface RoleBasedAccess {
  canAccessCoordination: boolean;
  canAccessTimerControls: boolean;
  canAccessScoreManagement: boolean;
  canAccessCardManagement: boolean;
  canAccessGoalManagement: boolean;
  userRole: string | null;
  assignedTeam: string | null;
  assignedResponsibilities: string[];
}

export const useRoleBasedAccess = (fixtureId: number | null) => {
  const [access, setAccess] = useState<RoleBasedAccess>({
    canAccessCoordination: false,
    canAccessTimerControls: false,
    canAccessScoreManagement: false,
    canAccessCardManagement: false,
    canAccessGoalManagement: false,
    userRole: null,
    assignedTeam: null,
    assignedResponsibilities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (fixtureId) {
      checkUserAccess();
    } else {
      setIsLoading(false);
    }
  }, [fixtureId]);

  const checkUserAccess = async () => {
    if (!fixtureId) return;

    try {
      setIsLoading(true);

      // Check if user is authenticated referee
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setAccess(prev => ({ ...prev }));
        return;
      }

      // Check user's role in auth_roles
      const { data: roleData } = await supabase
        .from('auth_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      const userRole = roleData?.role || 'viewer';

      // Get user's assignments for this fixture
      const userAssignments = await refereeAssignmentService.getUserAssignments(fixtureId);

      // Determine access based on role and assignments
      const hasAssignment = userAssignments.length > 0;
      const isReferee = userRole === 'referee' || userRole === 'admin';
      
      // Extract assignment details
      const primaryAssignment = userAssignments[0];
      const assignedTeam = primaryAssignment?.team_assignment || null;
      const assignedResponsibilities = primaryAssignment?.responsibilities || [];
      const assignedRole = primaryAssignment?.assigned_role || null;

      // Access permissions
      const canAccessCoordination = isReferee && hasAssignment;
      const canAccessTimerControls = isReferee && (
        assignedResponsibilities.includes('time_tracking') || 
        userRole === 'admin'
      );
      const canAccessScoreManagement = isReferee && (
        assignedResponsibilities.includes('score_goals') || 
        userRole === 'admin'
      );
      const canAccessCardManagement = isReferee && (
        assignedResponsibilities.includes('cards_discipline') || 
        userRole === 'admin'
      );
      const canAccessGoalManagement = isReferee && (
        assignedResponsibilities.includes('score_goals') || 
        userRole === 'admin'
      );

      setAccess({
        canAccessCoordination,
        canAccessTimerControls,
        canAccessScoreManagement,
        canAccessCardManagement,
        canAccessGoalManagement,
        userRole,
        assignedTeam,
        assignedResponsibilities
      });

    } catch (error) {
      console.error('Error checking user access:', error);
      setAccess(prev => ({ ...prev }));
    } finally {
      setIsLoading(false);
    }
  };

  return { ...access, isLoading };
};
