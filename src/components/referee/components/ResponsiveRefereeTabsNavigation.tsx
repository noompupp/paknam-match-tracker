
import { Target, Timer, CreditCard, BarChart3 } from "lucide-react";
import ResponsiveTabsList from "../shared/ResponsiveTabsList";
import StickyBackground from "@/components/shared/StickyBackground";

const ResponsiveRefereeTabsNavigation = () => {
  const tabs = [
    {
      value: "score",
      label: "Score",
      icon: <Target className="h-4 w-4" />
    },
    {
      value: "timer-tracking", 
      label: "Timer & Tracking",
      icon: <Timer className="h-4 w-4" />
    },
    {
      value: "cards",
      label: "Cards", 
      icon: <CreditCard className="h-4 w-4" />
    },
    {
      value: "summary",
      label: "Summary",
      icon: <BarChart3 className="h-4 w-4" />
    }
  ];

  return (
    <StickyBackground variant="navigation" className="mb-6">
      <ResponsiveTabsList 
        tabs={tabs}
        className="bg-transparent"
      />
    </StickyBackground>
  );
};

export default ResponsiveRefereeTabsNavigation;
