
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Teams from "@/components/Teams";
import Fixtures from "@/components/Fixtures";
import RefereeTools from "@/components/RefereeTools";
import MorePage from "@/components/MorePage";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import ProtectedTabWrapper from "@/components/auth/ProtectedTabWrapper";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleNavigateToFixtures = () => {
    setActiveTab("fixtures");
  };

  const handleNavigateToRecentResults = () => {
    setActiveTab("fixtures");
    // Small delay to ensure tab content is rendered
    setTimeout(() => {
      const element = document.getElementById("recent-results");
      if (element) {
        // Mobile navigation offset (70px for navigation bar)
        const mobileOffset = window.innerWidth < 768 ? 70 : 0;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY - mobileOffset;
        
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
        
        // Add visual feedback
        element.classList.add('highlight-section');
        setTimeout(() => {
          element.classList.remove('highlight-section');
        }, 2000);
      }
    }, 100);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigateToFixtures={handleNavigateToRecentResults} />;
      case "teams":
        return (
          <div className="pb-24 sm:pb-28">
            <Teams />
          </div>
        );
      case "fixtures":
        return (
          <div className="pb-24 sm:pb-28">
            <Fixtures />
          </div>
        );
      case "referee":
        return (
          <div className="pb-24 sm:pb-28">
            <ProtectedTabWrapper
              tabId="referee"
              title="Referee Tools Access"
              description="Enter the passcode to access referee tools and match management features."
            >
              <RefereeTools />
            </ProtectedTabWrapper>
          </div>
        );
      case "notifications":
        return (
          <div className="pb-24 sm:pb-28">
            <ProtectedTabWrapper
              tabId="more"
              title="Administrative Access"
              description="Enter the passcode to access system management and debug tools."
            >
              <MorePage />
            </ProtectedTabWrapper>
          </div>
        );
      default:
        return <Dashboard onNavigateToFixtures={handleNavigateToRecentResults} />;
    }
  };

  return (
    <AuthProvider>
      <NavigationProvider onTabChange={setActiveTab}>
        <div className="min-h-screen">
          {renderContent()}
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </NavigationProvider>
    </AuthProvider>
  );
};

export default Index;
