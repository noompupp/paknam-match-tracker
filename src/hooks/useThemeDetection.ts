
import { useState, useEffect } from 'react';

export interface ThemeInfo {
  isDark: boolean;
  isLight: boolean;
  systemTheme: 'light' | 'dark';
  preferredScheme: 'light' | 'dark' | 'no-preference';
}

export const useThemeDetection = (): ThemeInfo => {
  const [themeInfo, setThemeInfo] = useState<ThemeInfo>({
    isDark: false,
    isLight: true,
    systemTheme: 'light',
    preferredScheme: 'no-preference'
  });

  useEffect(() => {
    const updateTheme = () => {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      const isDark = darkModeQuery.matches;
      const isLight = lightModeQuery.matches;
      const systemTheme = isDark ? 'dark' : 'light';
      
      let preferredScheme: 'light' | 'dark' | 'no-preference' = 'no-preference';
      if (isDark) preferredScheme = 'dark';
      else if (isLight) preferredScheme = 'light';

      setThemeInfo({
        isDark,
        isLight,
        systemTheme,
        preferredScheme
      });
    };

    // Initial theme detection
    updateTheme();

    // Listen for theme changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    darkModeQuery.addEventListener('change', updateTheme);
    lightModeQuery.addEventListener('change', updateTheme);

    return () => {
      darkModeQuery.removeEventListener('change', updateTheme);
      lightModeQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  return themeInfo;
};
