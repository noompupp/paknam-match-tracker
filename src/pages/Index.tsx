
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Teams from "@/components/Teams";
import Fixtures from "@/components/Fixtures";
import RefereeTools from "@/components/RefereeTools";
import MorePage from "@/components/MorePage";
import Navigation from "@/components/Navigation";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedTabWrapper from "@/components/auth/ProtectedTabWrapper";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "teams":
        return <Teams />;
      case "fixtures":
        return <Fixtures />;
      case "referee":
        return (
          <ProtectedTabWrapper
            tabId="referee"
            title="Referee Tools Access"
            description="Access referee tools and match management features."
            requiresAuth={true}
            minimumRole="referee"
          >
            <RefereeTools />
          </ProtectedTabWrapper>
        );
      case "notifications":
        return (
          <ProtectedTabWrapper
            tabId="more"
            title="Administrative Access"
            description="Access system management and administrative tools."
            requiresAuth={true}
            minimumRole="admin"
          >
            <MorePage />
          </ProtectedTabWrapper>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <div className="min-h-screen">
          {renderContent()}
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
};

export default Index;
