
import { supabase } from '@/integrations/supabase/client';

export interface UserRoleInfo {
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  canAccessRefereeTools: boolean;
  canAccessCoordination: boolean;
  canManageWorkflow: boolean;
}

// Add "referee_rater" to role logic here
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

      // "admin" has all permissions.
      // "referee_rater" has referee powers as well as rater.
      let canAccessRefereeTools = false;
      let canAccessCoordination = false;
      let canManageWorkflow = false;

      if (userRole === 'admin' || userRole === 'referee' || userRole === 'referee_rater') {
        canAccessRefereeTools = true;
        canAccessCoordination = true;
        canManageWorkflow = true;
      }

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

      // Create role for user (could specify 'referee_rater' if desired)
      const { error } = await supabase
        .from('auth_roles')
        .insert({
          user_id: userId,
          role: defaultRole // can explicitly pass "referee_rater"
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
