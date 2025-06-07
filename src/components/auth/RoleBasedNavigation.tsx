
import React from 'react';
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { Button } from "@/components/ui/button";
import { Home, Calendar, Trophy, Flag, LogOut, User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RoleBasedNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RoleBasedNavigation = ({ activeTab, onTabChange }: RoleBasedNavigationProps) => {
  const { user, signOut } = useSecureAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSignIn = () => {
    // Navigate to sign in by setting activeTab - the AppContent will handle showing SecureLogin
    onTabChange('auth');
  };

  const handleProtectedTabClick = (tabId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to access referee tools and advanced features.",
        variant: "default"
      });
      onTabChange('auth');
    } else {
      onTabChange(tabId);
    }
  };

  // Base navigation items available to all users (including non-authenticated)
  const baseNavItems = [
    { id: "dashboard", label: "Latest", icon: Home },
    { id: "results", label: "Results", icon: Trophy },
    { id: "fixtures", label: "Fixtures", icon: Calendar },
  ];

  // Protected navigation items for authenticated users
  const protectedNavItems = [
    { 
      id: "referee", 
      label: "Referee", 
      icon: Flag, 
      requiredRole: "referee",
      description: "Access referee tools and match management"
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-800 z-50 safe-bottom"
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), 0.5rem)`,
        height: `calc(70px + env(safe-area-inset-bottom))`
      }}
    >
      <div className="flex justify-between items-center max-w-md mx-auto px-4 py-2 h-[70px]">
        {/* Base navigation items - always visible */}
        {baseNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200 relative touch-target ${
                isActive 
                  ? "text-primary rounded-xl border border-transparent" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              style={isActive ? {
                background: 'var(--nav-active-bg)',
                borderColor: 'var(--nav-active-border)',
                boxShadow: 'var(--nav-active-glow)'
              } : {}}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}

        {/* Protected navigation items with visual indicators */}
        {protectedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAccessible = user; // For now, any authenticated user can access
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleProtectedTabClick(item.id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200 relative touch-target ${
                isActive 
                  ? "text-primary rounded-xl border border-transparent" 
                  : isAccessible
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    : "text-muted-foreground/60 hover:text-muted-foreground/80 hover:bg-muted/20"
              }`}
              style={isActive ? {
                background: 'var(--nav-active-bg)',
                borderColor: 'var(--nav-active-border)',
                boxShadow: 'var(--nav-active-glow)'
              } : {}}
              title={isAccessible ? item.description : "Sign in to access this feature"}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {!isAccessible && (
                  <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground/60" />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
        
        {/* Authentication button with enhanced UX */}
        {user ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title={`Sign out (${user.email})`}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-medium">Exit</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignIn}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Sign in to access referee tools"
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Login</span>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
