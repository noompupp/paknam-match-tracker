import React, { useState, useEffect } from "react";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import SecureLogin from "./SecureLogin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute = ({ children, requiredRole, fallback }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useSecureAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || <SecureLogin />;
  }

  // For role-based access, we'll check asynchronously
  // This is a simplified approach - in production you might want to cache role checks
  if (requiredRole) {
    return (
      <RoleBasedAccess requiredRole={requiredRole} fallback={fallback}>
        {children}
      </RoleBasedAccess>
    );
  }

  return <>{children}</>;
};

interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredRole: string;
  fallback?: React.ReactNode;
}

const RoleBasedAccess = ({ children, requiredRole, fallback }: RoleBasedAccessProps) => {
  const { hasRole } = useSecureAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      const access = await hasRole(requiredRole);
      setHasAccess(access);
    };
    checkRole();
  }, [requiredRole, hasRole]);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Checking Permissions...</h2>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
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

export default ProtectedRoute;
