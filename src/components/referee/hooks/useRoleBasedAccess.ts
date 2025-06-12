
import { useState, useEffect } from 'react';
import { userRoleService, UserRoleInfo } from '@/services/referee/userRoleService';

interface RoleBasedAccess extends UserRoleInfo {
  canAccessTimerControls: boolean;
  canAccessScoreManagement: boolean;
  canAccessCardManagement: boolean;
  canAccessGoalManagement: boolean;
  assignedTeam: string | null;
  assignedResponsibilities: string[];
}

export const useRoleBasedAccess = (fixtureId: number | null) => {
  const [access, setAccess] = useState<RoleBasedAccess>({
    userId: null,
    role: null,
    isAuthenticated: false,
    canAccessRefereeTools: false,
    canAccessCoordination: false,
    canManageWorkflow: false,
    canAccessTimerControls: false,
    canAccessScoreManagement: false,
    canAccessCardManagement: false,
    canAccessGoalManagement: false,
    assignedTeam: null,
    assignedResponsibilities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (fixtureId) {
      checkUserAccess();
    } else {
      setAccess(prev => ({ ...prev }));
      setIsLoading(false);
    }
  }, [fixtureId]);

  const checkUserAccess = async () => {
    if (!fixtureId) return;

    try {
      setIsLoading(true);
      console.log('🔐 useRoleBasedAccess: Checking access for fixture:', fixtureId);

      // Get current user role information
      const roleInfo = await userRoleService.getCurrentUserRole();
      console.log('📋 useRoleBasedAccess: Role info received:', roleInfo);

      // If user is authenticated but has no role, try to create one
      if (roleInfo.isAuthenticated && !roleInfo.role && roleInfo.userId) {
        console.log('🔧 useRoleBasedAccess: User has no role, attempting to create referee role...');
        const roleCreated = await userRoleService.ensureUserHasRole(roleInfo.userId, 'referee');
        
        if (roleCreated) {
          // Re-check role info after creation
          const updatedRoleInfo = await userRoleService.getCurrentUserRole();
          console.log('✅ useRoleBasedAccess: Updated role info:', updatedRoleInfo);
          
          setAccess({
            ...updatedRoleInfo,
            canAccessTimerControls: updatedRoleInfo.canAccessRefereeTools,
            canAccessScoreManagement: updatedRoleInfo.canAccessRefereeTools,
            canAccessCardManagement: updatedRoleInfo.canAccessRefereeTools,
            canAccessGoalManagement: updatedRoleInfo.canAccessRefereeTools,
            assignedTeam: null,
            assignedResponsibilities: []
          });
          return;
        }
      }

      // Set access based on role info
      const enhancedAccess: RoleBasedAccess = {
        ...roleInfo,
        canAccessTimerControls: roleInfo.canAccessRefereeTools,
        canAccessScoreManagement: roleInfo.canAccessRefereeTools,
        canAccessCardManagement: roleInfo.canAccessRefereeTools,
        canAccessGoalManagement: roleInfo.canAccessRefereeTools,
        assignedTeam: null,
        assignedResponsibilities: []
      };

      console.log('✅ useRoleBasedAccess: Final access configuration:', enhancedAccess);
      setAccess(enhancedAccess);

    } catch (error) {
      console.error('❌ useRoleBasedAccess: Error checking access:', error);
      
      // Fallback: if there's an error, still allow access for authenticated users
      try {
        const fallbackRoleInfo = await userRoleService.getCurrentUserRole();
        if (fallbackRoleInfo.isAuthenticated) {
          console.log('🔄 useRoleBasedAccess: Using fallback permissive access');
          setAccess({
            ...fallbackRoleInfo,
            canAccessRefereeTools: true,
            canAccessCoordination: true,
            canManageWorkflow: true,
            canAccessTimerControls: true,
            canAccessScoreManagement: true,
            canAccessCardManagement: true,
            canAccessGoalManagement: true,
            assignedTeam: null,
            assignedResponsibilities: []
          });
        }
      } catch (fallbackError) {
        console.error('❌ useRoleBasedAccess: Fallback also failed:', fallbackError);
        setAccess(prev => ({ ...prev }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { ...access, isLoading };
};
