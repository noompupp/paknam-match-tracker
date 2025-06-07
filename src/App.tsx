
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SecureAuthProvider, useSecureAuth } from "@/contexts/SecureAuthContext";
import { AuthProvider } from "@/contexts/AuthContext"; // Keep for backward compatibility
import SecureLogin from "@/components/auth/SecureLogin";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import Teams from "@/components/Teams";
import Fixtures from "@/components/Fixtures";
import ProtectedTabWrapper from "@/components/auth/ProtectedTabWrapper";
import RefereeToolsContainer from "@/components/referee/RefereeToolsContainer";
import Notifications from "@/components/Notifications";

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading } = useSecureAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Initializing secure session...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <SecureLogin />;
  }

  // Main application interface for authenticated users
  const renderContent = () => {
    switch (activeTab) {
      case "teams":
        return <Teams />;
      case "fixtures":
        return <Fixtures />;
      case "referee":
        return (
          <ProtectedTabWrapper 
            tabId="referee" 
            title="Referee Tools Access"
            description="Enter the referee access code to use match management tools"
          >
            <RefereeToolsContainer />
          </ProtectedTabWrapper>
        );
      case "notifications":
        return (
          <ProtectedTabWrapper 
            tabId="notifications" 
            title="Enhanced Features"
            description="Enter access code for enhanced features and notifications"
          >
            <Notifications />
          </ProtectedTabWrapper>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="pb-20">
        {renderContent()}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

function App() {
  return (
    <SecureAuthProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </SecureAuthProvider>
  );
}

export default App;
