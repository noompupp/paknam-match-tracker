
import { useState } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import PasscodeModal from "./PasscodeModal";

interface ProtectedTabWrapperProps {
  children: React.ReactNode;
  tabId: string;
  title: string;
  description: string;
  requiresAuth?: boolean;
  minimumRole?: 'viewer' | 'referee' | 'admin';
}

const ProtectedTabWrapper = ({ 
  children, 
  tabId, 
  title, 
  description, 
  requiresAuth = false,
  minimumRole = 'viewer'
}: ProtectedTabWrapperProps) => {
  const { user, userRole, isLoading } = useSupabaseAuth();
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg pb-20 flex items-center justify-center">
        <div className="text-center text-white space-y-6 max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-3xl font-bold">Loading...</h2>
          <p className="text-white/80 text-lg">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Check if user has sufficient role
  const hasMinimumRole = () => {
    if (!userRole) return minimumRole === 'viewer';
    
    const roleHierarchy = { 'viewer': 1, 'referee': 2, 'admin': 3 };
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 1;
    
    return userLevel >= requiredLevel;
  };

  // If authentication is required and user is not logged in
  if (requiresAuth && !user) {
    return (
      <div className="min-h-screen gradient-bg pb-20 flex items-center justify-center">
        <div className="text-center text-white space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold">Authentication Required</h2>
            <p className="text-white/80 text-lg">
              You need to be logged in to access this section.
            </p>
          </div>
          
          <a 
            href="/auth"
            className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // If user doesn't have sufficient role
  if (requiresAuth && user && !hasMinimumRole()) {
    return (
      <div className="min-h-screen gradient-bg pb-20 flex items-center justify-center">
        <div className="text-center text-white space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-3xl font-bold">Insufficient Permissions</h2>
            <p className="text-white/80 text-lg">
              You need {minimumRole} role or higher to access this section.
            </p>
            <p className="text-white/60 text-sm">
              Your current role: {userRole || 'none'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user has access or no auth is required, show content
  return <>{children}</>;
};

export default ProtectedTabWrapper;
