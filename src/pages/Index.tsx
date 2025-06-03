
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Teams from "@/components/Teams";
import Fixtures from "@/components/Fixtures";
import RefereeTools from "@/components/RefereeTools";
import MorePage from "@/components/MorePage";
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
        return <MorePage />;
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
