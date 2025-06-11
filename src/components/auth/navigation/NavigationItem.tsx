
import React from 'react';
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { NavigationItemProps, ProtectedNavigationItem } from './types';

const NavigationItem = ({ 
  item, 
  isActive, 
  isProtected = false, 
  isAccessible = true, 
  onClick, 
  textRef 
}: NavigationItemProps) => {
  const Icon = item.icon;
  const protectedItem = item as ProtectedNavigationItem;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`mobile-nav-item transition-all duration-200 relative ${
        isActive 
          ? "text-primary bg-primary/10 rounded-xl border border-primary/20" 
          : isAccessible
            ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            : "text-muted-foreground/60 hover:text-muted-foreground/80 hover:bg-muted/20"
      } flex-shrink-0`}
      title={isAccessible ? protectedItem.description : "Sign in to access this feature"}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {isProtected && !isAccessible && (
          <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground/60" />
        )}
      </div>
      <span 
        ref={textRef}
        className="text-xs font-medium whitespace-nowrap"
      >
        {item.label}
      </span>
    </Button>
  );
};

export default NavigationItem;
