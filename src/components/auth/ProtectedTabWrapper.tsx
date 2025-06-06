
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PasscodeModal from "./PasscodeModal";

interface ProtectedTabWrapperProps {
  children: React.ReactNode;
  tabId: string;
  title: string;
  description: string;
}

const ProtectedTabWrapper = ({ children, tabId, title, description }: ProtectedTabWrapperProps) => {
  const { isAuthenticated, authenticate } = useAuth();
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);

  // If user is already authenticated for this tab, show the content
  if (isAuthenticated(tabId)) {
    return <>{children}</>;
  }

  // If not authenticated, show passcode modal when requested
  const handleAuthenticate = () => {
    setShowPasscodeModal(true);
  };

  const handleAuthSuccess = () => {
    authenticate(tabId);
    setShowPasscodeModal(false);
  };

  const handleModalClose = () => {
    setShowPasscodeModal(false);
  };

  // Show placeholder content when not authenticated
  return (
    <>
      <div className="min-h-screen gradient-bg pb-20 flex items-center justify-center">
        <div className="text-center text-white space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold">Protected Area</h2>
            <p className="text-white/80 text-lg">
              This section requires authentication to access.
            </p>
          </div>
          
          <button
            onClick={handleAuthenticate}
            className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Enter Passcode
          </button>
        </div>
      </div>

      <PasscodeModal
        isOpen={showPasscodeModal}
        onClose={handleModalClose}
        onSuccess={handleAuthSuccess}
        title={title}
        description={description}
      />
    </>
  );
};

export default ProtectedTabWrapper;
