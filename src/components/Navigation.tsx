
import RoleBasedNavigation from "@/components/auth/RoleBasedNavigation";

// This component is kept for backward compatibility but redirects to RoleBasedNavigation
interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  console.warn('⚠️ Navigation component is deprecated. Use RoleBasedNavigation instead.');
  return <RoleBasedNavigation activeTab={activeTab} onTabChange={onTabChange} />;
};

export default Navigation;
