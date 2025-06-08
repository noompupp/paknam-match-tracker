
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
 * Creates optimized style object for score display
 */
export const getScoreStyle = (teamColor: string, isDarkMode: boolean = false) => {
  const { color, needsOutline } = getEnhancedScoreColor(teamColor, isDarkMode);
  
  return {
    color,
    textShadow: needsOutline 
      ? '0 1px 3px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)'
      : '0 1px 2px rgba(0, 0, 0, 0.2)',
    WebkitTextStroke: needsOutline ? '0.5px rgba(255, 255, 255, 0.8)' : undefined,
    fontWeight: 'bold',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
  };
};

/**
 * Gets simplified card type without redundant "card" text
 */
export const getSimplifiedCardType = (card: any): string => {
  const cardType = card?.card_type || card?.type || 'yellow';
  // Remove "card" from the end if it exists to prevent "YELLOW CARD card"
  return cardType.toString().replace(/\s*card$/i, '').toUpperCase();
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
