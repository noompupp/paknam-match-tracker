
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
      <div className="w-full space-y-2 referee-tabs-mobile">
        {/* First row - 3 tabs */}
        <TabsList className="grid w-full grid-cols-3 h-auto bg-muted/50 p-1">
          {tabs.slice(0, 3).map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex flex-col items-center justify-center gap-1 h-12 min-h-[44px] px-2 py-1.5 text-xs font-medium rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <span className="leading-none truncate max-w-full">{tab.shortLabel}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {/* Second row - 3 tabs */}
        <TabsList className="grid w-full grid-cols-3 h-auto bg-muted/50 p-1">
          {tabs.slice(3).map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex flex-col items-center justify-center gap-1 h-12 min-h-[44px] px-2 py-1.5 text-xs font-medium rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <span className="leading-none truncate max-w-full">{tab.shortLabel}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    );
  }

  // Desktop layout - single row with full labels
  return (
    <TabsList className="grid w-full grid-cols-6 h-10 bg-muted p-1">
      {tabs.map((tab) => (
        <TabsTrigger 
          key={tab.value} 
          value={tab.value}
          className="text-sm font-medium px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ResponsiveRefereeTabsNavigation;
