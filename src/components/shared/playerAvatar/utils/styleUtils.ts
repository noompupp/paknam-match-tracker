
import { cn } from "@/lib/utils";
import { TeamColors, SizeClasses } from "../types";

export const sizeClasses: SizeClasses = {
  small: "w-8 h-8 text-xs",
  medium: "w-12 h-12 text-sm", 
  large: "w-16 h-16 text-base"
};

export const badgeSizeClasses: SizeClasses = {
  small: "w-6 h-6 text-xs",
  medium: "w-8 h-8 text-sm",
  large: "w-10 h-10 text-base"
};

export const getJerseyStyle = (teamColors: TeamColors) => {
  const baseGradient = `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 60%, ${teamColors.accent} 100%)`;
  
  return {
    background: baseGradient,
    boxShadow: `
      0 0 20px ${teamColors.primary}40,
      inset 0 2px 4px rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.1)
    `,
    position: 'relative' as const,
    overflow: 'hidden' as const
  };
};

export const getNumberTypography = (size: keyof SizeClasses) => {
  const baseStyles = "font-black leading-none tracking-tight relative z-20";
  
  switch (size) {
    case "small":
      return cn(baseStyles, "text-xs", "drop-shadow-sm");
    case "medium":
      return cn(baseStyles, "text-lg", "drop-shadow-md");
    case "large":
      return cn(baseStyles, "text-2xl", "drop-shadow-lg");
    default:
      return cn(baseStyles, "text-lg", "drop-shadow-md");
  }
};

export const getFootballPattern = (size: keyof SizeClasses) => {
  const patternSize = size === "small" ? "6px" : size === "medium" ? "8px" : "10px";
  const opacity = "0.15";
  
  return {
    backgroundImage: `
      radial-gradient(circle at 25% 25%, rgba(255,255,255,${opacity}) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(255,255,255,${opacity}) 1px, transparent 1px),
      linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%)
    `,
    backgroundSize: `${patternSize} ${patternSize}, ${patternSize} ${patternSize}, ${patternSize} ${patternSize}, ${patternSize} ${patternSize}`,
    backgroundPosition: '0 0, 0 0, 0 0, 0 0'
  };
};

export const getFlipIndicatorStyle = (teamColors: TeamColors) => ({
  backgroundColor: teamColors.primary,
  color: teamColors.contrast,
  boxShadow: `0 0 8px ${teamColors.primary}60`
});

export const getPlayerInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
