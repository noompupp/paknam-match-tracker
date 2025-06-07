import { createContext, useContext, ReactNode } from "react";

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
  // This is a deprecated implementation
  // All functionality should migrate to SecureAuthContext
  
  const isAuthenticated = (tab: string): boolean => {
    console.warn('⚠️ Using deprecated AuthContext. Please migrate to SecureAuthContext.');
    return false; // Force migration by returning false
  };

  const authenticate = (tab: string) => {
    console.warn('⚠️ Using deprecated AuthContext. Please migrate to SecureAuthContext.');
  };

  const logout = (tab: string) => {
    console.warn('⚠️ Using deprecated AuthContext. Please migrate to SecureAuthContext.');
  };

  const clearAllSessions = () => {
    console.warn('⚠️ Using deprecated AuthContext. Please migrate to SecureAuthContext.');
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
