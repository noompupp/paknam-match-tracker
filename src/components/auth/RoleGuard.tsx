
import React, { useState, useEffect } from 'react';
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { Shield, Lock, User } from "lucide-react";

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
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse" />
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
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <User className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold">Sign In Required</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                This feature requires authentication. Please sign in to access referee tools and advanced features.
              </p>
              <div className="space-y-3 pt-4">
                <p className="text-sm text-white/60">
                  Referee features include:
                </p>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Match management and scoring</li>
                  <li>• Player time tracking</li>
                  <li>• Cards and statistics management</li>
                  <li>• Match summary generation</li>
                </ul>
              </div>
              <div className="pt-4">
                <p className="text-xs text-white/50">
                  You can continue browsing public content without signing in.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen gradient-bg pb-20 flex items-center justify-center">
        <div className="text-center text-white space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 backdrop-blur-sm">
              <Lock className="h-10 w-10 text-red-300" />
            </div>
            <h2 className="text-3xl font-bold">Access Restricted</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              You don't have the required permissions to access this area.
              {requiredRole && (
                <span className="block mt-2 text-white/60">
                  Required role: <span className="font-semibold capitalize">{requiredRole}</span>
                </span>
              )}
            </p>
            <div className="pt-4">
              <p className="text-sm text-white/60">
                Contact an administrator if you believe you should have access to this area.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
