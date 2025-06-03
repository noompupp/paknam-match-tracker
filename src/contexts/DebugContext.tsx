
import React, { createContext, useContext, useState } from 'react';

interface DebugContextType {
  showDebug: boolean;
  setShowDebug: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDebug: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebugContext must be used within a DebugProvider');
  }
  return context;
};

interface DebugProviderProps {
  children: React.ReactNode;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
  const [showDebug, setShowDebug] = useState(false);

  const toggleDebug = () => setShowDebug(prev => !prev);

  return (
    <DebugContext.Provider value={{ showDebug, setShowDebug, toggleDebug }}>
      {children}
    </DebugContext.Provider>
  );
};
