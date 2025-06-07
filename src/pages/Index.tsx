
import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import Teams from "@/components/Teams";
import Fixtures from "@/components/Fixtures";
import RefereeTools from "@/components/RefereeTools";
import MorePage from "@/components/MorePage";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import ProtectedTabWrapper from "@/components/auth/ProtectedTabWrapper";
import PWAInstallButton from "@/components/PWAInstallButton";

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
        // Enhanced mobile navigation offset calculation
        const navHeight = 70;
        const safeAreaBottom = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-bottom').replace('px', '')) || 0;
        const totalOffset = navHeight + safeAreaBottom + 20; // Extra padding for better UX
        
        const elementPosition = element.getBoundingClientRect().top + window.scrollY - totalOffset;
        
        window.scrollTo({
          top: Math.max(0, elementPosition),
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
    const baseClasses = "content-container mobile-safe-bottom";
    
    switch (activeTab) {
      case "dashboard":
        return (
          <div className={baseClasses}>
            <Dashboard onNavigateToFixtures={handleNavigateToRecentResults} />
          </div>
        );
      case "teams":
        return (
          <div className={baseClasses}>
            <Teams />
          </div>
        );
      case "fixtures":
        return (
          <div className={baseClasses}>
            <Fixtures />
          </div>
        );
      case "referee":
        return (
          <div className={baseClasses}>
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
          <div className={baseClasses}>
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
        return (
          <div className={baseClasses}>
            <Dashboard onNavigateToFixtures={handleNavigateToRecentResults} />
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <NavigationProvider onTabChange={setActiveTab}>
        <div className="min-h-screen min-h-dvh safe-x">
          {renderContent()}
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          <PWAInstallButton />
        </div>
      </NavigationProvider>
    </AuthProvider>
  );
};

export default Index;
