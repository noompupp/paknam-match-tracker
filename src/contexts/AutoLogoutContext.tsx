
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useSecureAuth } from './SecureAuthContext';
import { useToast } from '@/hooks/use-toast';

interface AutoLogoutContextType {
  resetInactivityTimer: () => void;
}

const AutoLogoutContext = createContext<AutoLogoutContextType | undefined>(undefined);

interface AutoLogoutProviderProps {
  children: ReactNode;
  inactivityTimeout?: number; // in milliseconds
  checkInterval?: number; // in milliseconds
}

export const AutoLogoutProvider = ({ 
  children, 
  inactivityTimeout = 30 * 60 * 1000, // 30 minutes
  checkInterval = 60 * 1000 // 1 minute
}: AutoLogoutProviderProps) => {
  const { user, signOut, session } = useSecureAuth();
  const { toast } = useToast();
  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityListenersSet = useRef<boolean>(false);

  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
  };

  const checkForAutoLogout = async () => {
    if (!user || !session) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Check for inactivity timeout
    if (timeSinceLastActivity >= inactivityTimeout) {
      console.log('🔐 Auto-logout: Inactivity timeout reached');
      
      toast({
        title: "Session Expired",
        description: "You have been automatically signed out due to inactivity.",
        variant: "default"
      });
      
      await signOut();
      return;
    }

    // Check for token expiration
    if (session.expires_at) {
      const tokenExpirationTime = session.expires_at * 1000; // Convert to milliseconds
      const timeUntilExpiration = tokenExpirationTime - now;
      
      // If token expires within the next check interval, logout
      if (timeUntilExpiration <= checkInterval) {
        console.log('🔐 Auto-logout: Token expiration imminent');
        
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "default"
        });
        
        await signOut();
        return;
      }
    }

    // Warn user 5 minutes before inactivity timeout
    const warningThreshold = 5 * 60 * 1000; // 5 minutes
    if (timeSinceLastActivity >= (inactivityTimeout - warningThreshold) && 
        timeSinceLastActivity < inactivityTimeout) {
      const minutesLeft = Math.ceil((inactivityTimeout - timeSinceLastActivity) / (60 * 1000));
      
      toast({
        title: "Session Warning",
        description: `Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} due to inactivity.`,
        variant: "default"
      });
    }
  };

  const setupActivityListeners = () => {
    if (activityListenersSet.current) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    activityListenersSet.current = true;

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      activityListenersSet.current = false;
    };
  };

  useEffect(() => {
    if (user && session) {
      console.log('🔐 Auto-logout: Setting up inactivity tracking');
      
      // Setup activity listeners
      const cleanupListeners = setupActivityListeners();
      
      // Start checking for auto-logout conditions
      checkIntervalRef.current = setInterval(checkForAutoLogout, checkInterval);
      
      // Reset timer on mount
      resetInactivityTimer();

      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        if (cleanupListeners) {
          cleanupListeners();
        }
      };
    } else {
      // Clear interval when user logs out
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
  }, [user, session, inactivityTimeout, checkInterval]);

  return (
    <AutoLogoutContext.Provider value={{ resetInactivityTimer }}>
      {children}
    </AutoLogoutContext.Provider>
  );
};

export const useAutoLogout = () => {
  const context = useContext(AutoLogoutContext);
  if (context === undefined) {
    throw new Error('useAutoLogout must be used within an AutoLogoutProvider');
  }
  return context;
};
