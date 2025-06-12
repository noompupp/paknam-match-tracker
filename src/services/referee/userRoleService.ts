
import { supabase } from '@/integrations/supabase/client';

export interface UserRoleInfo {
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  canAccessRefereeTools: boolean;
  canAccessCoordination: boolean;
  canManageWorkflow: boolean;
}

export const userRoleService = {
  async getCurrentUserRole(): Promise<UserRoleInfo> {
    try {
      console.log('🔐 UserRoleService: Checking current user role...');
      
      // Check authentication
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ UserRoleService: Auth error:', userError);
        return {
          userId: null,
          role: null,
          isAuthenticated: false,
          canAccessRefereeTools: false,
          canAccessCoordination: false,
          canManageWorkflow: false
        };
      }

      if (!userData.user) {
        console.log('ℹ️ UserRoleService: No authenticated user');
        return {
          userId: null,
          role: null,
          isAuthenticated: false,
          canAccessRefereeTools: false,
          canAccessCoordination: false,
          canManageWorkflow: false
        };
      }

      console.log('✅ UserRoleService: User authenticated:', userData.user.id);

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('auth_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (roleError) {
        console.error('❌ UserRoleService: Error getting role:', roleError);
        // Default to viewer role on error
        return {
          userId: userData.user.id,
          role: 'viewer',
          isAuthenticated: true,
          canAccessRefereeTools: false,
          canAccessCoordination: false,
          canManageWorkflow: false
        };
      }

      const userRole = roleData?.role || 'viewer';
      console.log(`✅ UserRoleService: User role: ${userRole}`);

      // Determine permissions based on role
      const canAccessRefereeTools = ['admin', 'referee'].includes(userRole);
      const canAccessCoordination = ['admin', 'referee'].includes(userRole);
      const canManageWorkflow = ['admin', 'referee'].includes(userRole);

      const roleInfo: UserRoleInfo = {
        userId: userData.user.id,
        role: userRole,
        isAuthenticated: true,
        canAccessRefereeTools,
        canAccessCoordination,
        canManageWorkflow
      };

      console.log('✅ UserRoleService: Role info determined:', roleInfo);
      return roleInfo;

    } catch (error) {
      console.error('❌ UserRoleService: Unexpected error:', error);
      return {
        userId: null,
        role: null,
        isAuthenticated: false,
        canAccessRefereeTools: false,
        canAccessCoordination: false,
        canManageWorkflow: false
      };
    }
  },

  async ensureUserHasRole(userId: string, defaultRole: string = 'referee'): Promise<boolean> {
    try {
      console.log(`🔧 UserRoleService: Ensuring user ${userId} has role...`);
      
      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from('auth_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        console.log(`✅ UserRoleService: User already has role: ${existingRole.role}`);
        return true;
      }

      // Create role for user
      const { error } = await supabase
        .from('auth_roles')
        .insert({
          user_id: userId,
          role: defaultRole
        });

      if (error) {
        console.error('❌ UserRoleService: Error creating role:', error);
        return false;
      }

      console.log(`✅ UserRoleService: Created ${defaultRole} role for user`);
      return true;

    } catch (error) {
      console.error('❌ UserRoleService: Error ensuring user role:', error);
      return false;
    }
  }
};
