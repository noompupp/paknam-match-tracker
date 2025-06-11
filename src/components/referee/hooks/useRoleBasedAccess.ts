
import { useState, useEffect } from 'react';
import { useSecureAuth } from '@/contexts/SecureAuthContext';

export const useRoleBasedAccess = (fixtureId: number | null) => {
  const [canAccessCoordination, setCanAccessCoordination] = useState(false);
  const [canAccessTimer, setCanAccessTimer] = useState(false);
  const [canAccessScore, setCanAccessScore] = useState(false);
  const [canAccessCards, setCanAccessCards] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { hasRole, isAuthenticated } = useSecureAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated() || !fixtureId) {
        setCanAccessCoordination(false);
        setCanAccessTimer(false);
        setCanAccessScore(false);
        setCanAccessCards(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has referee or admin role
        const hasRefereeRole = await hasRole('referee');
        const hasAdminRole = await hasRole('admin');
        
        // For now, if user has referee or admin role, they can access all functionality
        // In the future, this could be more granular based on specific role assignments
        const hasAccess = hasRefereeRole || hasAdminRole;
        
        setCanAccessCoordination(hasAccess);
        setCanAccessTimer(hasAccess);
        setCanAccessScore(hasAccess);
        setCanAccessCards(hasAccess);
      } catch (error) {
        console.error('Error checking role access:', error);
        setCanAccessCoordination(false);
        setCanAccessTimer(false);
        setCanAccessScore(false);
        setCanAccessCards(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [fixtureId, hasRole, isAuthenticated]);

  return {
    canAccessCoordination,
    canAccessTimer,
    canAccessScore,
    canAccessCards,
    isLoading
  };
};
