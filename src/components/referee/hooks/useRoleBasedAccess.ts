
import { useState, useEffect } from 'react';
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { refereeAssignmentService } from '@/services/referee/assignmentService';
import { coordinationService } from '@/services/referee/coordinationService';

export interface UserRole {
  assignmentId: string;
  assignedRole: string;
  teamAssignment: string | null;
  responsibilities: string[];
  status: string;
  workflowMode: string;
}

export const useRoleBasedAccess = (fixtureId: number | null) => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSecureAuth();

  useEffect(() => {
    const loadUserRoles = async () => {
      if (!fixtureId || !user) {
        setUserRoles([]);
        return;
      }

      try {
        setIsLoading(true);
        
        // Load both assignment data and coordination data to get complete picture
        const [assignments, coordinationData] = await Promise.all([
          refereeAssignmentService.getUserAssignments(fixtureId),
          coordinationService.getCoordinationData(fixtureId)
        ]);

        console.log('🎯 User assignments loaded:', assignments);
        console.log('🎯 Coordination data loaded:', coordinationData);

        // Convert assignments to UserRole format
        const roles = assignments.map(assignment => ({
          assignmentId: assignment.assignment_id,
          assignedRole: assignment.assigned_role,
          teamAssignment: assignment.team_assignment,
          responsibilities: assignment.responsibilities,
          status: assignment.status,
          workflowMode: assignment.workflow_mode
        }));

        setUserRoles(roles);
      } catch (error) {
        console.error('Error loading user roles:', error);
        setUserRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRoles();
  }, [fixtureId, user]);

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return userRoles.some(userRole => userRole.assignedRole === role);
  };

  // Check if user has a specific responsibility
  const hasResponsibility = (responsibility: string): boolean => {
    return userRoles.some(userRole => 
      userRole.responsibilities.includes(responsibility)
    );
  };

  // Get user's roles for a specific team
  const getTeamRoles = (teamAssignment: string): UserRole[] => {
    return userRoles.filter(role => role.teamAssignment === teamAssignment);
  };

  // Check if user can access timer functionality
  const canAccessTimer = (): boolean => {
    return hasRole('time_tracking') || hasResponsibility('time_tracking') || hasRole('home_team') || hasRole('away_team');
  };

  // Check if user can access score functionality
  const canAccessScore = (): boolean => {
    return hasRole('score_goals') || hasResponsibility('score_goals') || hasRole('home_team') || hasRole('away_team');
  };

  // Check if user can access cards functionality
  const canAccessCards = (): boolean => {
    return hasRole('cards_discipline') || hasResponsibility('cards_discipline') || hasRole('home_team') || hasRole('away_team');
  };

  // Check if user can access coordination functionality
  const canAccessCoordination = (): boolean => {
    return hasRole('coordination') || hasResponsibility('coordination');
  };

  // Get current user's active assignments
  const getActiveAssignments = (): UserRole[] => {
    return userRoles.filter(role => role.status === 'active');
  };

  // Get current user's completed assignments
  const getCompletedAssignments = (): UserRole[] => {
    return userRoles.filter(role => role.status === 'completed');
  };

  return {
    userRoles,
    isLoading,
    hasRole,
    hasResponsibility,
    getTeamRoles,
    canAccessTimer,
    canAccessScore,
    canAccessCards,
    canAccessCoordination,
    getActiveAssignments,
    getCompletedAssignments
  };
};
