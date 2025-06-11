
import { usePlatformDetection } from "@/hooks/usePlatformDetection";

export const getMobileSpacing = (isMobile: boolean, variant: 'tight' | 'normal' | 'loose' = 'normal') => {
  if (!isMobile) {
    return {
      tight: "space-y-6",
      normal: "space-y-8",
      loose: "space-y-10"
    }[variant];
  }

  return {
    tight: "space-y-4",
    normal: "space-y-6",
    loose: "space-y-8"
  }[variant];
};

export const getMobileContainer = (isMobile: boolean) => {
  return isMobile 
    ? "container-responsive mobile-content-spacing px-4"
    : "max-w-7xl mx-auto px-4";
};

export const getMobileBottomPadding = (isMobile: boolean, hasNavigation = true) => {
  if (!isMobile) return "pb-8";
  
  return hasNavigation 
    ? "pb-safe-bottom mobile-safe-bottom" 
    : "pb-8";
};

export const useMobileLayoutClasses = () => {
  const { isMobile, isIOS } = usePlatformDetection();
  
  return {
    pageContainer: `
      gradient-bg min-h-screen min-h-dvh w-full overflow-x-hidden
      ${isMobile && isIOS ? 'safe-x safe-y' : ''}
      ${isMobile && !isIOS ? 'safe-x' : ''}
    `,
    contentContainer: getMobileContainer(isMobile),
    bottomSpacing: getMobileBottomPadding(isMobile),
    spacing: getMobileSpacing(isMobile)
  };
};
