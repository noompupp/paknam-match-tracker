
import React, { useEffect, useRef } from 'react';
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { Button } from "@/components/ui/button";
import { Home, Calendar, Trophy, Flag, LogOut, User, Lock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlatformDetection } from "@/hooks/usePlatformDetection";
import { useTranslation } from "@/hooks/useTranslation";

interface RoleBasedNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RoleBasedNavigation = ({ activeTab, onTabChange }: RoleBasedNavigationProps) => {
  const { user, signOut } = useSecureAuth();
  const { toast } = useToast();
  const { isStandalone, isMobile } = usePlatformDetection();
  const { t } = useTranslation();
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
    onTabChange('auth');
  };

  const handleProtectedTabClick = (tabId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: t('message.signInRequired'),
        variant: "default"
      });
      onTabChange('auth');
    } else {
      onTabChange(tabId);
    }
  };

  // Dynamic text optimization for PWA mode
  useEffect(() => {
    if (isStandalone) {
      textRefs.current.forEach((textElement) => {
        if (textElement) {
          const text = textElement.textContent || '';
          if (text.length > 7) {
            textElement.setAttribute('data-long-text', 'true');
          } else {
            textElement.removeAttribute('data-long-text');
          }
        }
      });
    }
  }, [isStandalone]);

  // Base navigation items available to all users
  const baseNavItems = [
    { id: "dashboard", label: t('nav.latest'), icon: Home },
    { id: "teams", label: t('nav.teams'), icon: Users },
    { id: "results", label: t('nav.results'), icon: Trophy },
    { id: "fixtures", label: t('nav.fixtures'), icon: Calendar },
  ];

  // Protected navigation items for authenticated users
  const protectedNavItems = [
    { 
      id: "referee", 
      label: t('nav.referee'), 
      icon: Flag, 
      requiredRole: "referee",
      description: "Access referee tools and match management"
    },
  ];

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-50 safe-bottom ${
        isMobile ? 'mobile-nav-enhanced' : 'mobile-nav-enhanced'
      }`}
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), 0.5rem)`,
        height: `calc(70px + env(safe-area-inset-bottom))`
      }}
    >
      {/* Enhanced navigation container with overflow handling */}
      <div className="nav-container">
        <div className="flex justify-between items-center px-2 sm:px-4 py-2 h-[70px] min-w-fit">
          {/* Base navigation items - always visible */}
          {baseNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(item.id)}
                className={`mobile-nav-item transition-all duration-200 relative ${
                  isActive 
                    ? "text-primary bg-primary/10 rounded-xl border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                } flex-shrink-0`}
              >
                <Icon className="h-5 w-5" />
                <span 
                  ref={(el) => textRefs.current[index] = el}
                  className="text-xs font-medium whitespace-nowrap"
                >
                  {item.label}
                </span>
              </Button>
            );
          })}

          {/* Protected navigation items with visual indicators */}
          {protectedNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAccessible = user;
            const refIndex = baseNavItems.length + index;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleProtectedTabClick(item.id)}
                className={`mobile-nav-item transition-all duration-200 relative ${
                  isActive 
                    ? "text-primary bg-primary/10 rounded-xl border border-primary/20" 
                    : isAccessible
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      : "text-muted-foreground/60 hover:text-muted-foreground/80 hover:bg-muted/20"
                } flex-shrink-0`}
                title={isAccessible ? item.description : "Sign in to access this feature"}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {!isAccessible && (
                    <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground/60" />
                  )}
                </div>
                <span 
                  ref={(el) => textRefs.current[refIndex] = el}
                  className="text-xs font-medium whitespace-nowrap"
                >
                  {item.label}
                </span>
              </Button>
            );
          })}
          
          {/* Authentication button with enhanced UX */}
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="mobile-nav-item transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              title={`Sign out (${user.email})`}
            >
              <LogOut className="h-5 w-5" />
              <span 
                ref={(el) => textRefs.current[baseNavItems.length + protectedNavItems.length] = el}
                className="text-xs font-medium whitespace-nowrap"
              >
                {t('nav.signOut')}
              </span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignIn}
              className="mobile-nav-item transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
              title="Sign in to access referee tools"
            >
              <User className="h-5 w-5" />
              <span 
                ref={(el) => textRefs.current[baseNavItems.length + protectedNavItems.length] = el}
                className="text-xs font-medium whitespace-nowrap"
              >
                {t('nav.login')}
              </span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
