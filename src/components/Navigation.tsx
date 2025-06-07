
import { Button } from "@/components/ui/button";
import { Home, Calendar, Bell, BarChart3, Flag, Lock, LogOut } from "lucide-react";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { user, signOut, hasRole } = useSecureAuth();
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

  const navItems = [
    { id: "dashboard", label: "Latest", icon: Home, protected: false },
    { id: "teams", label: "Teams", icon: BarChart3, protected: false },
    { id: "fixtures", label: "Fixtures", icon: Calendar, protected: false },
    { id: "referee", label: "Referee", icon: Flag, protected: true },
    { id: "notifications", label: "More", icon: Bell, protected: true },
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
        {navItems.map((item) => {
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
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.protected && (
                  <Lock className="h-3 w-3 absolute -top-1 -right-1 text-orange-500" />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
        
        {/* Sign out button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Exit</span>
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
