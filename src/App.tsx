
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SecureAuthProvider, useSecureAuth } from "@/contexts/SecureAuthContext";
import { AuthProvider } from "@/contexts/AuthContext"; // Keep for backward compatibility
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import SecureLogin from "@/components/auth/SecureLogin";
import RoleBasedNavigation from "@/components/auth/RoleBasedNavigation";
import RoleGuard from "@/components/auth/RoleGuard";
import Dashboard from "@/components/Dashboard";
import Teams from "@/components/Teams";
import Fixtures from "@/components/Fixtures";
import Results from "@/components/Results";
import RefereeToolsContainer from "@/components/referee/RefereeToolsContainer";
import UnifiedContainer from "@/components/shared/UnifiedContainer";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading } = useSecureAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <UnifiedContainer variant="page" className="flex items-center justify-center">
        <div className="text-center text-foreground">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Initializing secure session...</p>
        </div>
      </UnifiedContainer>
    );
  }

  // Handle authentication tab - show login screen with close functionality
  if (activeTab === 'auth') {
    return (
      <UnifiedContainer variant="page">
        <SecureLogin 
          onSuccess={() => setActiveTab('dashboard')} 
          onClose={() => setActiveTab('dashboard')}
          showCloseButton={true}
        />
      </UnifiedContainer>
    );
  }

  // Navigation handlers
  const handleNavigateToResults = () => {
    setActiveTab("results");
  };

  // Main application interface - enhanced for viewer experience
  const renderContent = () => {
    switch (activeTab) {
      case "teams":
        return (
          <UnifiedContainer variant="page">
            <Teams />
          </UnifiedContainer>
        );
      case "results":
        return (
          <UnifiedContainer variant="page">
            <Results />
          </UnifiedContainer>
        );
      case "fixtures":
        return (
          <UnifiedContainer variant="page">
            <Fixtures />
          </UnifiedContainer>
        );
      case "referee":
        return (
          <UnifiedContainer variant="page">
            <RoleGuard requiredRole="referee">
              <RefereeToolsContainer />
            </RoleGuard>
          </UnifiedContainer>
        );
      default:
        return (
          <UnifiedContainer variant="page">
            <Dashboard onNavigateToResults={handleNavigateToResults} />
          </UnifiedContainer>
        );
    }
  };

  return (
    <>
      <main className="pb-20">
        {renderContent()}
      </main>
      <RoleBasedNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SecureAuthProvider>
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </SecureAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
