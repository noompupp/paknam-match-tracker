
import { Team } from "@/types/database";
import { TeamColors } from "../types";

export const getTeamColors = (team?: Team): TeamColors => {
  const defaultColors: TeamColors = {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#60a5fa',
    contrast: '#ffffff',
    shadow: 'rgba(0,0,0,0.3)'
  };

  if (!team?.color) return defaultColors;

  // Convert hex to RGB for calculations
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 };
  };

  // Calculate luminance for contrast decisions
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Generate contrasting colors
  const rgb = hexToRgb(team.color);
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  // Smart contrast selection
  const textColor = luminance > 0.5 ? '#000000' : '#ffffff';
  const shadowColor = luminance > 0.5 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
  
  // Generate secondary colors
  const darkenFactor = luminance > 0.7 ? 0.3 : 0.2;
  const lightenFactor = luminance < 0.3 ? 0.3 : 0.2;
  
  const secondary = `rgb(${Math.max(0, rgb.r - rgb.r * darkenFactor)}, ${Math.max(0, rgb.g - rgb.g * darkenFactor)}, ${Math.max(0, rgb.b - rgb.b * darkenFactor)})`;
  const accent = `rgb(${Math.min(255, rgb.r + (255 - rgb.r) * lightenFactor)}, ${Math.min(255, rgb.g + (255 - rgb.g) * lightenFactor)}, ${Math.min(255, rgb.b + (255 - rgb.b) * lightenFactor)})`;

  return {
    primary: team.color,
    secondary,
    accent,
    contrast: textColor,
    shadow: shadowColor
  };
};
