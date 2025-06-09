
import { Target, Timer, CreditCard, BarChart3 } from "lucide-react";
import ResponsiveTabsList from "../shared/ResponsiveTabsList";

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
    <ResponsiveTabsList 
      tabs={tabs}
      className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-6"
    />
  );
};

export default ResponsiveRefereeTabsNavigation;
