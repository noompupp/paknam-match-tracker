
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { usePlatformDetection } from "@/hooks/usePlatformDetection";

interface UnifiedContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'page' | 'content' | 'section';
  spacing?: 'tight' | 'normal' | 'loose';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '7xl' | 'full';
  enableTopSafePadding?: boolean;
  enableBottomSafePadding?: boolean;
}

const UnifiedContainer = ({
  children,
  className,
  variant = 'content',
  spacing = 'normal',
  maxWidth = '7xl',
  enableTopSafePadding = true,
  enableBottomSafePadding = true
}: UnifiedContainerProps) => {
  const { isMobile, isIOS } = usePlatformDetection();
  
  const spacingClasses = {
    tight: "space-y-4",
    normal: "space-y-6", 
    loose: "space-y-8"
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    '7xl': "max-w-7xl",
    full: "max-w-none"
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'page':
        return cn(
          // Premier League gradient background
          "gradient-bg min-h-screen min-h-dvh",
          "w-full overflow-x-hidden",
          // Enhanced safe area support
          enableTopSafePadding && "pt-6",
          enableBottomSafePadding && "pb-6",
          // iOS specific safe areas
          isMobile && isIOS && "safe-x safe-y",
          isMobile && !isIOS && "safe-x",
          // Additional mobile optimizations
          "antialiased"
        );
      case 'content':
        return cn(
          maxWidthClasses[maxWidth],
          "mx-auto px-4 py-4",
          enableTopSafePadding && "pt-4",
          enableBottomSafePadding && "pb-24",
          isMobile && "px-4 py-4",
          "mobile-content-spacing"
        );
      case 'section':
        return cn(
          "w-full",
          spacingClasses[spacing],
          "px-4"
        );
      default:
        return "";
    }
  };

  return (
    <div 
      className={cn(getVariantClasses(), className)}
      style={{
        paddingTop: enableTopSafePadding && variant === 'page' && isMobile
          ? `max(1.5rem, env(safe-area-inset-top))`
          : undefined,
        paddingBottom: enableBottomSafePadding && variant === 'page' && isMobile
          ? `max(1.5rem, env(safe-area-inset-bottom))`
          : undefined
      }}
    >
      {children}
    </div>
  );
};

export default UnifiedContainer;
