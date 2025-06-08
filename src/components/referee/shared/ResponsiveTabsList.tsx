
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface ResponsiveTabsListProps {
  tabs: TabItem[];
  className?: string;
}

const ResponsiveTabsList = ({ tabs, className }: ResponsiveTabsListProps) => {
  const isMobile = useIsMobile();

  return (
    <TabsList className={cn(
      "referee-tabs-list",
      isMobile 
        ? "grid w-full grid-cols-2 sm:grid-cols-3 gap-1 h-auto p-1" 
        : "inline-flex h-10 p-1",
      className
    )}>
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(
            "referee-tab-trigger relative transition-all duration-200",
            isMobile 
              ? "flex-col h-12 px-2 py-1 text-xs" 
              : "flex-row h-8 px-3 py-1 text-sm",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "hover:bg-muted/50"
          )}
        >
          <div className={cn(
            "flex items-center gap-1",
            isMobile ? "flex-col" : "flex-row"
          )}>
            {tab.icon && (
              <span className={cn(
                "shrink-0",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {tab.icon}
              </span>
            )}
            <span className="truncate font-medium">
              {tab.label}
            </span>
            {tab.badge && (
              <span className={cn(
                "absolute -top-1 -right-1 bg-destructive text-destructive-foreground",
                "text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5",
                "flex items-center justify-center font-bold"
              )}>
                {tab.badge}
              </span>
            )}
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ResponsiveTabsList;
