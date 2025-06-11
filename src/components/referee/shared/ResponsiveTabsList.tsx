
import React from 'react';
import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import TabTrigger from "../navigation/TabTrigger";
import { ResponsiveTabsListProps } from "../navigation/tabTypes";

const ResponsiveTabsList = ({ tabs, className }: ResponsiveTabsListProps) => {
  const isMobile = useIsMobile();

  return (
    <TabsList className={cn(
      "bg-muted rounded-lg",
      isMobile 
        ? "grid w-full grid-cols-2 sm:grid-cols-3 gap-1 h-auto p-1" 
        : "inline-flex h-10 p-1",
      className
    )}>
      {tabs.map((tab) => (
        <TabTrigger
          key={tab.value}
          tab={tab}
          isMobile={isMobile}
        />
      ))}
    </TabsList>
  );
};

export default ResponsiveTabsList;
