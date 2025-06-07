
import { Button } from "@/components/ui/button";
import { Home, Calendar, Bell, BarChart3, Flag, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { isAuthenticated } = useAuth();
  const { user, userRole, canModifyData, isAdmin } = useSupabaseAuth();

  const navItems = [
    { id: "dashboard", label: "Latest", icon: Home, protected: false },
    { id: "teams", label: "Teams", icon: BarChart3, protected: false },
    { id: "fixtures", label: "Fixtures", icon: Calendar, protected: false },
    { id: "referee", label: "Referee Tools", icon: Flag, protected: true, requiresRole: 'referee' },
    { id: "notifications", label: "More", icon: Bell, protected: true, requiresRole: 'admin' },
  ];

  const getItemStatus = (item: any) => {
    if (!item.protected) return 'accessible';
    if (!user) return 'requires-auth';
    
    if (item.requiresRole === 'referee' && !canModifyData()) return 'insufficient-role';
    if (item.requiresRole === 'admin' && !isAdmin()) return 'insufficient-role';
    
    return 'accessible';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const status = getItemStatus(item);
          const isLocked = status !== 'accessible';
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-colors relative ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isLocked && (
                  <Lock className="h-3 w-3 absolute -top-1 -right-1 text-orange-500" />
                )}
                {user && status === 'accessible' && item.protected && (
                  <div className="h-2 w-2 absolute -top-1 -right-1 bg-green-500 rounded-full" />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
        
        {/* Auth status indicator */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => user ? null : window.location.href = '/auth'}
          className="flex flex-col items-center gap-1 h-auto py-2 px-3 transition-colors"
        >
          <div className="relative">
            <User className="h-5 w-5" />
            {user && (
              <div className="h-2 w-2 absolute -top-1 -right-1 bg-green-500 rounded-full" />
            )}
          </div>
          <span className="text-xs font-medium">
            {user ? userRole || 'User' : 'Login'}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
