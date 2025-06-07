
import { useCallback } from 'react';

export interface NavigationContextType {
  navigateToTab: (tab: string) => void;
  activeTab: string;
}

export const useNavigation = (onTabChange: (tab: string) => void, activeTab: string): NavigationContextType => {
  const navigateToTab = useCallback((tab: string) => {
    onTabChange(tab);
  }, [onTabChange]);

  return {
    navigateToTab,
    activeTab
  };
};
