
import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TabTriggerProps } from './tabTypes';

const TabTrigger = ({ tab, isMobile, className }: TabTriggerProps) => {
  const IconComponent = tab.icon;

  return (
    <TabsTrigger
      key={tab.value}
      value={tab.value}
      className={cn(
        "relative transition-all duration-200",
        isMobile 
          ? "flex-col h-12 px-2 py-1 text-xs" 
          : "flex-row h-8 px-3 py-1 text-sm",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        "hover:bg-muted/50",
        className
      )}
    >
      <div className={cn(
        "flex items-center gap-1",
        isMobile ? "flex-col" : "flex-row"
      )}>
        {IconComponent && (
          <span className={cn(
            "shrink-0",
            isMobile ? "text-xs" : "text-sm"
          )}>
            <IconComponent className="h-4 w-4" />
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
  );
};

export default TabTrigger;
