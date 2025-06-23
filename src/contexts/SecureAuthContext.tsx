
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from '@/services/operationLoggingService';

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => Promise<boolean>;
  isAuthenticated: () => boolean;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

interface SecureAuthProviderProps {
  children: ReactNode;
}

export const SecureAuthProvider = ({ children }: SecureAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Enhanced logging for security monitoring
        if (session?.user) {
          setTimeout(() => {
            operationLoggingService.logOperation({
              operation_type: `auth_${event}`,
              table_name: 'auth.users',
              record_id: session.user.id,
              payload: { 
                event, 
                user_id: session.user.id,
                session_expires_at: session.expires_at,
                token_hash: session.access_token ? 'present' : 'missing'
              },
              success: true
            });
          }, 0);
        }

        // Handle token refresh events for enhanced security
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔐 Token refreshed successfully');
        }

        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          console.log('🔐 User signed out');
          setSession(null);
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting secure sign in...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        await operationLoggingService.logOperation({
          operation_type: 'auth_signin_failed',
          payload: { email: email.trim().toLowerCase(), error: error.message },
          error_message: error.message,
          success: false
        });
        return { error };
      }

      console.log('✅ Secure sign in successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('🔐 Attempting secure sign up...');
    
    try {
      // Use the current window location for proper redirect handling
      const currentUrl = window.location.href;
      const redirectUrl = currentUrl.includes('localhost') 
        ? 'http://localhost:5173/'
        : `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        await operationLoggingService.logOperation({
          operation_type: 'auth_signup_failed',
          payload: { email: email.trim().toLowerCase(), error: error.message },
          error_message: error.message,
          success: false
        });
        return { error };
      }

      console.log('✅ Secure sign up successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('🔐 Signing out...');
    
    try {
      if (user) {
        await operationLoggingService.logOperation({
          operation_type: 'auth_signout',
          table_name: 'auth.users',
          record_id: user.id,
          success: true
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
      } else {
        console.log('✅ Signed out successfully');
      }
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  /**
   * Enhanced hasRole:
   * Allows "admin" to access anything.
   * Allows "referee_rater" to access both "referee" and "rater" protected areas, and its own ("referee_rater").
   * NOTE: role comparison is case sensitive; expects lowercase.
   */
  const hasRole = async (role: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('get_user_role', {
        user_uuid: user.id
      });
      if (error) {
        console.error('❌ Role check error:', error);
        return false;
      }

      const userRole = (data as string) || '';
      // Always let admin access everything
      if (userRole === 'admin') return true;

      // "referee_rater" behaves as both referee and rater
      if (userRole === 'referee_rater') {
        // Can access 'referee', 'rater', or 'referee_rater' protected areas
        return ['referee', 'rater', 'referee_rater'].includes(role);
      }

      // Normal equality check for other roles
      return userRole === role;
    } catch (error) {
      console.error('❌ Role check error:', error);
      return false;
    }
  };

  const isAuthenticated = (): boolean => !!user && !!session;

  return (
    <SecureAuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      hasRole,
      isAuthenticated
    }}>
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error("useSecureAuth must be used within a SecureAuthProvider");
  }
  return context;
};
