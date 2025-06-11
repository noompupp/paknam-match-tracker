
import React from 'react';
import { NavigationContainerProps } from './types';

const NavigationContainer = ({ children }: NavigationContainerProps) => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 mobile-nav-enhanced z-50 safe-bottom"
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), 0.5rem)`,
        height: `calc(70px + env(safe-area-inset-bottom))`,
        background: 'var(--navigation-background)',
        backdropFilter: 'var(--header-backdrop-blur)',
        borderTop: '1px solid var(--header-border)'
      }}
    >
      <div className="nav-container overflow-hidden">
        <div className="flex justify-between items-center px-2 sm:px-4 py-2 h-[70px] w-full max-w-full overflow-x-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </nav>
  );
};

export default NavigationContainer;
