
import { useState, useEffect } from 'react';
import { useSecureAuth } from '@/contexts/SecureAuthContext';

export const useRoleBasedAccess = (fixtureId: number | null) => {
  const [canAccessCoordination, setCanAccessCoordination] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { hasRole, isAuthenticated } = useSecureAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated() || !fixtureId) {
        setCanAccessCoordination(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has referee or admin role
        const hasRefereeRole = await hasRole('referee');
        const hasAdminRole = await hasRole('admin');
        
        setCanAccessCoordination(hasRefereeRole || hasAdminRole);
      } catch (error) {
        console.error('Error checking role access:', error);
        setCanAccessCoordination(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [fixtureId, hasRole, isAuthenticated]);

  return {
    canAccessCoordination,
    isLoading
  };
};
