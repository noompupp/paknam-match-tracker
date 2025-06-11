
import React from 'react';
import { NavigationContainerProps } from './types';

const NavigationContainer = ({ children }: NavigationContainerProps) => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 mobile-nav-enhanced"
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), 0.5rem)`,
        height: `calc(70px + env(safe-area-inset-bottom))`,
        background: 'var(--navigation-background)',
        borderTop: '1px solid var(--header-border)',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'var(--header-backdrop-blur)'
      }}
    >
      <div className="nav-container h-full w-full max-w-full overflow-hidden">
        <div className="flex justify-between items-center px-3 sm:px-4 py-2 h-[70px] w-full max-w-full">
          {children}
        </div>
      </div>
    </nav>
  );
};

export default NavigationContainer;
