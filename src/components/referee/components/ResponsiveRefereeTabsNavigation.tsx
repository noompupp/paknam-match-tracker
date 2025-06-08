
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Timer, Target, CreditCard, Clock, BarChart3, Trophy } from "lucide-react";

const ResponsiveRefereeTabsNavigation = () => {
  const isMobile = useIsMobile();

  const tabs = [
    { value: "score", label: "Score", icon: Trophy, shortLabel: "Score" },
    { value: "timer", label: "Timer", icon: Timer, shortLabel: "Timer" },
    { value: "goals", label: "Goals", icon: Target, shortLabel: "Goals" },
    { value: "cards", label: "Cards", icon: CreditCard, shortLabel: "Cards" },
    { value: "time", label: "Time", icon: Clock, shortLabel: "Time" },
    { value: "summary", label: "Summary", icon: BarChart3, shortLabel: "Summary" }
  ];

  if (isMobile) {
    return (
      <div className="w-full">
        {/* Two-row layout for mobile */}
        <TabsList className="grid w-full grid-cols-3 mb-2">
          {tabs.slice(0, 3).map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex flex-col gap-1 h-12 text-xs"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.shortLabel}</span>
                <span className="sm:hidden">{tab.shortLabel.slice(0, 3)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsList className="grid w-full grid-cols-3">
          {tabs.slice(3).map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex flex-col gap-1 h-12 text-xs"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.shortLabel}</span>
                <span className="sm:hidden">{tab.shortLabel.slice(0, 3)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    );
  }

  // Desktop layout
  return (
    <TabsList className="grid w-full grid-cols-6">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value}>
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ResponsiveRefereeTabsNavigation;
