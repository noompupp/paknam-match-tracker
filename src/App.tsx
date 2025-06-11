
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SecureAuthProvider, useSecureAuth } from "@/contexts/SecureAuthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import SecureLogin from "@/components/auth/SecureLogin";
import RoleBasedNavigation from "@/components/auth/RoleBasedNavigation";
import RoleGuard from "@/components/auth/RoleGuard";
import Dashboard from "@/components/Dashboard";
import Teams from "@/components/Teams";
import Fixtures from "@/components/Fixtures";
import Results from "@/components/Results";
import RefereeToolsContainer from "@/components/referee/RefereeToolsContainer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading } = useSecureAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-foreground">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Initializing secure session...</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'auth') {
    return (
      <SecureLogin 
        onSuccess={() => setActiveTab('dashboard')} 
        onClose={() => setActiveTab('dashboard')}
        showCloseButton={true}
      />
    );
  }

  const handleNavigateToResults = () => {
    setActiveTab("results");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "teams":
        return <Teams />;
      case "results":
        return <Results />;
      case "fixtures":
        return <Fixtures />;
      case "referee":
        return (
          <RoleGuard requiredRole="referee">
            <RefereeToolsContainer />
          </RoleGuard>
        );
      default:
        return <Dashboard onNavigateToResults={handleNavigateToResults} />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <main 
        className="pt-4 px-4 pb-24 min-h-screen"
        style={{
          paddingBottom: 'calc(var(--mobile-nav-total-height) + 1rem)',
          paddingLeft: 'max(1rem, var(--safe-area-inset-left))',
          paddingRight: 'max(1rem, var(--safe-area-inset-right))'
        }}
      >
        <div className="container-responsive">
          {renderContent()}
        </div>
      </main>
      <RoleBasedNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
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
