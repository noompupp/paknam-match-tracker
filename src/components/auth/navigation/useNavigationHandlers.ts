
import { useCallback } from 'react';
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { useToast } from "@/hooks/use-toast";
import { NavigationHandlers } from './types';

export const useNavigationHandlers = (onTabChange: (tab: string) => void): NavigationHandlers => {
  const { user, signOut } = useSecureAuth();
  const { toast } = useToast();

  const handleSignOut = useCallback(async () => {
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
  }, [signOut, toast]);

  const handleSignIn = useCallback(() => {
    onTabChange('auth');
  }, [onTabChange]);

  const handleProtectedTabClick = useCallback((tabId: string) => {
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
  }, [user, toast, onTabChange]);

  return {
    handleSignOut,
    handleSignIn,
    handleProtectedTabClick
  };
};
