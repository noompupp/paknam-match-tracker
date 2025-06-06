
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: (tab: string) => boolean;
  authenticate: (tab: string) => void;
  logout: (tab: string) => void;
  clearAllSessions: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authenticatedTabs, setAuthenticatedTabs] = useState<Set<string>>(new Set());

  // Load authentication state from sessionStorage on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("referee-auth");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (Array.isArray(parsed)) {
          setAuthenticatedTabs(new Set(parsed));
        }
      } catch (error) {
        console.error("Failed to parse saved authentication state:", error);
        sessionStorage.removeItem("referee-auth");
      }
    }
  }, []);

  // Save authentication state to sessionStorage whenever it changes
  useEffect(() => {
    const authArray = Array.from(authenticatedTabs);
    if (authArray.length > 0) {
      sessionStorage.setItem("referee-auth", JSON.stringify(authArray));
    } else {
      sessionStorage.removeItem("referee-auth");
    }
  }, [authenticatedTabs]);

  const isAuthenticated = (tab: string): boolean => {
    return authenticatedTabs.has(tab);
  };

  const authenticate = (tab: string) => {
    setAuthenticatedTabs(prev => new Set([...prev, tab]));
  };

  const logout = (tab: string) => {
    setAuthenticatedTabs(prev => {
      const newSet = new Set(prev);
      newSet.delete(tab);
      return newSet;
    });
  };

  const clearAllSessions = () => {
    setAuthenticatedTabs(new Set());
    sessionStorage.removeItem("referee-auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, logout, clearAllSessions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
