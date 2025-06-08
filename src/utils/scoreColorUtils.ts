
/**
 * Utility functions for ensuring score color contrast and readability
 */

interface ColorContrastResult {
  color: string;
  className: string;
  needsOutline: boolean;
}

/**
 * Gets appropriate score color with enhanced contrast
 */
export const getEnhancedScoreColor = (teamColor: string, isDarkMode: boolean = false): ColorContrastResult => {
  // Handle missing or white colors
  if (!teamColor || teamColor === '#ffffff' || teamColor === '#FFFFFF' || teamColor === 'white') {
    return {
      color: isDarkMode ? '#e2e8f0' : '#1e293b', // slate-200 : slate-800
      className: 'score-text-shadow',
      needsOutline: false
    };
  }

  // Handle very light colors that would be invisible on white backgrounds
  const lightColors = ['#ffff00', '#ffffff', '#f0f0f0', '#ffd700', '#ffffe0', '#fffacd'];
  const isLightColor = lightColors.some(light => 
    teamColor.toLowerCase().includes(light.slice(1)) || 
    teamColor.toLowerCase() === light
  );

  if (isLightColor && !isDarkMode) {
    return {
      color: '#1e293b', // slate-800 for visibility
      className: 'score-text-shadow',
      needsOutline: true
    };
  }

  // Handle very dark colors on dark backgrounds
  const darkColors = ['#000000', '#1a1a1a', '#2d2d2d', '#333333'];
  const isDarkColor = darkColors.some(dark => 
    teamColor.toLowerCase().includes(dark.slice(1)) || 
    teamColor.toLowerCase() === dark
  );

  if (isDarkColor && isDarkMode) {
    return {
      color: '#f1f5f9', // slate-100 for visibility
      className: 'score-text-shadow',
      needsOutline: true
    };
  }

  // For all other colors, use them with enhanced shadow
  return {
    color: teamColor,
    className: 'score-text-outline',
    needsOutline: true
  };
};

/**
 * Creates optimized style object for score display with enhanced mobile styling
 */
export const getScoreStyle = (teamColor: string, isDarkMode: boolean = false, isMobile: boolean = false) => {
  const { color, needsOutline } = getEnhancedScoreColor(teamColor, isDarkMode);
  
  // Enhanced shadows and effects for mobile
  const mobileEnhancedShadow = isMobile 
    ? '0 3px 12px rgba(0, 0, 0, 0.5), 0 6px 24px rgba(0, 0, 0, 0.25), 0 1px 0 rgba(255, 255, 255, 0.5)'
    : '0 1px 3px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)';
  
  const standardShadow = isMobile 
    ? '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.3)'
    : '0 1px 2px rgba(0, 0, 0, 0.2)';
  
  return {
    color,
    textShadow: needsOutline ? mobileEnhancedShadow : standardShadow,
    WebkitTextStroke: needsOutline && isMobile ? '0.8px rgba(255, 255, 255, 0.8)' : 
                      needsOutline ? '0.5px rgba(255, 255, 255, 0.8)' : undefined,
    fontWeight: isMobile ? '800' : 'bold', // extra-bold for mobile
    letterSpacing: isMobile ? '-0.02em' : undefined, // slight letter spacing reduction for mobile
    filter: isMobile ? 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
  };
};

/**
 * Gets simplified card type without redundant "card" text
 */
export const getSimplifiedCardType = (card: any): string => {
  const cardType = card?.card_type || card?.type || 'yellow';
  // Clean up the card type: remove "card" suffix, replace underscores with spaces, and capitalize properly
  return cardType.toString()
    .replace(/\s*card$/i, '') // Remove "card" from the end
    .replace(/_/g, ' ') // Replace underscores with spaces
    .toLowerCase() // Convert to lowercase first
    .replace(/^\w/, (c: string) => c.toUpperCase()); // Capitalize first letter only
};

/**
 * Determines if a color needs contrast enhancement
 */
export const needsContrastEnhancement = (color: string, background: 'light' | 'dark' = 'light'): boolean => {
  if (!color) return true;
  
  const lightColors = ['#ffff00', '#ffffff', '#f0f0f0', '#ffd700', '#ffffe0'];
  const darkColors = ['#000000', '#1a1a1a', '#2d2d2d', '#333333'];
  
  if (background === 'light') {
    return lightColors.some(light => color.toLowerCase().includes(light.slice(1)));
  } else {
    return darkColors.some(dark => color.toLowerCase().includes(dark.slice(1)));
  }
};

/**
 * Gets neutral score styling that works consistently across light and dark modes
 * - In light mode: minimal or no shadow for better readability
 * - In dark mode: enhanced shadows for better contrast
 */
export const getNeutralScoreStyle = (isMobile: boolean = false) => {
  // Check if we're in dark mode using CSS custom properties
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Light mode: minimal shadows for clean readability
  const lightModeShadow = isMobile 
    ? '0 1px 2px rgba(0, 0, 0, 0.1)' // Very subtle shadow for mobile
    : '0 0.5px 1px rgba(0, 0, 0, 0.08)'; // Minimal shadow for desktop
  
  // Dark mode: enhanced shadows for better contrast
  const darkModeShadow = isMobile 
    ? '0 3px 12px rgba(0, 0, 0, 0.4), 0 6px 24px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.3)'
    : '0 2px 6px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.2)';
  
  return {
    color: 'hsl(var(--foreground))', // Uses theme-aware foreground color
    textShadow: isDarkMode ? darkModeShadow : lightModeShadow,
    WebkitTextStroke: isDarkMode && isMobile ? '0.5px rgba(0, 0, 0, 0.1)' : undefined,
    fontWeight: isMobile ? '800' : 'bold',
    letterSpacing: isMobile ? '-0.02em' : undefined,
    filter: isDarkMode && isMobile ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : undefined
  };
};
