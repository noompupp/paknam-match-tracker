
import React, { useState, useEffect } from 'react';
import { useSecureAuth } from "@/contexts/SecureAuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
  showLoginPrompt?: boolean;
}

const RoleGuard = ({ 
  children, 
  requiredRole, 
  fallback,
  showLoginPrompt = true 
}: RoleGuardProps) => {
  const { user, loading, hasRole } = useSecureAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!requiredRole) {
        setHasAccess(true);
        return;
      }

      if (!user) {
        setHasAccess(false);
        return;
      }

      try {
        const access = await hasRole(requiredRole);
        setHasAccess(access);
      } catch (error) {
        console.error('❌ Error checking user role:', error);
        setHasAccess(false);
      }
    };

    if (!loading) {
      checkAccess();
    }
  }, [user, loading, requiredRole, hasRole]);

  if (loading || hasAccess === null) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!user && showLoginPrompt) {
      return (
        <div className="min-h-screen gradient-bg pb-20 flex items-center justify-center">
          <div className="text-center text-white space-y-6 max-w-md mx-auto px-4">
            <div className="space-y-4">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-3xl font-bold">Authentication Required</h2>
              <p className="text-white/80 text-lg">
                Please sign in to access this protected area.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen gradient-bg pb-20 flex items-center justify-center">
        <div className="text-center text-white space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-3xl font-bold">Access Denied</h2>
            <p className="text-white/80 text-lg">
              You don't have permission to access this area.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
