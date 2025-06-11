
import React from 'react';
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import NavigationContainer from './navigation/NavigationContainer';
import NavigationItem from './navigation/NavigationItem';
import AuthButton from './navigation/AuthButton';
import { useNavigationHandlers } from './navigation/useNavigationHandlers';
import { useTextOptimization } from './navigation/useTextOptimization';
import { baseNavItems, protectedNavItems } from './navigation/navigationConfig';

interface RoleBasedNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RoleBasedNavigation = ({ activeTab, onTabChange }: RoleBasedNavigationProps) => {
  const { user } = useSecureAuth();
  const { handleSignOut, handleSignIn, handleProtectedTabClick } = useNavigationHandlers(onTabChange);
  
  const totalItems = baseNavItems.length + protectedNavItems.length + 1; // +1 for auth button
  const { setTextRef } = useTextOptimization(totalItems);

  return (
    <NavigationContainer>
      {/* Base navigation items - always visible */}
      {baseNavItems.map((item, index) => (
        <NavigationItem
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onClick={() => onTabChange(item.id)}
          textRef={setTextRef(index)}
        />
      ))}

      {/* Protected navigation items with visual indicators */}
      {protectedNavItems.map((item, index) => {
        const refIndex = baseNavItems.length + index;
        return (
          <NavigationItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            isProtected={true}
            isAccessible={!!user}
            onClick={() => handleProtectedTabClick(item.id)}
            textRef={setTextRef(refIndex)}
          />
        );
      })}
      
      {/* Authentication button with enhanced UX */}
      <AuthButton
        onSignOut={handleSignOut}
        onSignIn={handleSignIn}
        textRef={setTextRef(baseNavItems.length + protectedNavItems.length)}
      />
    </NavigationContainer>
  );
};

export default RoleBasedNavigation;
