
import { useState } from "react";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import SecurePasscodeModal from "./SecurePasscodeModal";

interface ProtectedTabWrapperProps {
  children: React.ReactNode;
  tabId: string;
  title: string;
  description: string;
  requiredRole?: string;
}

const ProtectedTabWrapper = ({ 
  children, 
  tabId, 
  title, 
  description,
  requiredRole = "referee"
}: ProtectedTabWrapperProps) => {
  const { user, hasRole } = useSecureAuth();
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Check if user has the required role asynchronously
  const checkAccess = async () => {
    if (!user) return false;
    
    try {
      const userHasRole = await hasRole(requiredRole);
      return userHasRole;
    } catch (error) {
      console.error('❌ Error checking user role:', error);
      return false;
    }
  };

  // If user has access, show the content
  if (hasAccess) {
    return <>{children}</>;
  }

  // If not authenticated, show login prompt
  if (!user) {
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

  // Show passcode modal when requested
  const handleAuthenticate = async () => {
    const userHasRole = await checkAccess();
    if (userHasRole) {
      setShowPasscodeModal(true);
    } else {
      // User doesn't have the required role
      return;
    }
  };

  const handleAuthSuccess = () => {
    setHasAccess(true);
    setShowPasscodeModal(false);
  };

  const handleModalClose = () => {
    setShowPasscodeModal(false);
  };

  // Show placeholder content when authenticated but access not granted
  return (
    <>
      <div className="min-h-screen gradient-bg pb-20 flex items-center justify-center">
        <div className="text-center text-white space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold">Protected Area</h2>
            <p className="text-white/80 text-lg">
              This section requires additional verification to access.
            </p>
          </div>
          
          <button
            onClick={handleAuthenticate}
            className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Enter Access Code
          </button>
        </div>
      </div>

      <SecurePasscodeModal
        isOpen={showPasscodeModal}
        onClose={handleModalClose}
        onSuccess={handleAuthSuccess}
        title={title}
        description={description}
        requiredRole={requiredRole}
      />
    </>
  );
};

export default ProtectedTabWrapper;
