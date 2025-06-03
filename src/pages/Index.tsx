
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Teams from "@/components/Teams";
import Fixtures from "@/components/Fixtures";
import RefereeTools from "@/components/RefereeTools";
import Navigation from "@/components/Navigation";

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
        return <RefereeTools />;
      case "notifications":
        return (
          <div className="min-h-screen gradient-bg flex items-center justify-center pb-20">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">More</h2>
              <p className="text-white/80">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderContent()}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
