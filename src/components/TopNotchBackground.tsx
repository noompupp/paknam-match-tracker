
import { useEffect, useState } from 'react';
import { useScrollOpacity } from '@/hooks/useScrollOpacity';

const TopNotchBackground = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { opacity } = useScrollOpacity({ threshold: 20, maxScroll: 80 });

  useEffect(() => {
    // Check initial system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Dynamic background with scroll-based opacity
  const dynamicBackground = isDarkMode 
    ? `rgba(34, 34, 34, ${0.1 + (opacity * 0.9)})` // Dark mode: 0.1 to 1.0
    : `rgba(255, 255, 255, ${0.1 + (opacity * 0.9)})`; // Light mode: 0.1 to 1.0

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-200 ease-out"
      style={{
        height: 'var(--safe-area-inset-top)',
        background: dynamicBackground,
        backdropFilter: `blur(${8 + (opacity * 4)}px)`, // 8px to 12px blur
        borderBottom: `1px solid rgba(255, 255, 255, ${opacity * 0.2})`
      }}
    />
  );
};

export default TopNotchBackground;
