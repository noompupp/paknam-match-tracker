
import React, { createContext, useContext, useCallback } from 'react';

interface NavigationContextType {
  navigateToSection: (tab: string, sectionId?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: React.ReactNode;
  onTabChange: (tab: string) => void;
}

export const NavigationProvider = ({ children, onTabChange }: NavigationProviderProps) => {
  const navigateToSection = useCallback((tab: string, sectionId?: string) => {
    onTabChange(tab);
    
    if (sectionId) {
      // Small delay to ensure tab content is rendered
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          // Mobile navigation offset (70px for navigation bar)
          const mobileOffset = window.innerWidth < 768 ? 70 : 0;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY - mobileOffset;
          
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
          
          // Add visual feedback
          element.classList.add('highlight-section');
          setTimeout(() => {
            element.classList.remove('highlight-section');
          }, 2000);
        }
      }, 100);
    }
  }, [onTabChange]);

  return (
    <NavigationContext.Provider value={{ navigateToSection }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
