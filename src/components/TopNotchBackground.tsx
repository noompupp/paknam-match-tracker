
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

  // Solid background colors that match navigation
  const solidBackground = isDarkMode 
    ? `rgba(17, 24, 39, ${0.9 + (opacity * 0.1)})` // Dark mode: solid dark background
    : `rgba(255, 255, 255, ${0.9 + (opacity * 0.1)})`; // Light mode: solid white background

  // Enhanced border with better visibility in dark mode
  const borderColor = isDarkMode
    ? `rgba(55, 65, 81, ${opacity * 0.6})` // Dark mode: more visible border
    : `rgba(229, 231, 235, ${opacity * 0.4})`; // Light mode: subtle border

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300 ease-out"
      style={{
        height: 'var(--safe-area-inset-top)',
        background: solidBackground,
        backdropFilter: `blur(${6 + (opacity * 6)}px)`, // Enhanced blur range: 6px to 12px
        WebkitBackdropFilter: `blur(${6 + (opacity * 6)}px)`, // Safari support
        borderBottom: `1px solid ${borderColor}`,
        boxShadow: isDarkMode 
          ? `0 1px 3px rgba(0, 0, 0, ${opacity * 0.3})` // Dark mode: subtle shadow
          : `0 1px 2px rgba(0, 0, 0, ${opacity * 0.1})` // Light mode: very subtle shadow
      }}
    />
  );
};

export default TopNotchBackground;
