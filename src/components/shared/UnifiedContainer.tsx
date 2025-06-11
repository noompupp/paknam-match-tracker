
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
}

const UnifiedContainer = ({
  children,
  className,
  variant = 'content',
  spacing = 'normal',
  maxWidth = '7xl',
  enableTopSafePadding = true
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
          "gradient-bg min-h-screen min-h-dvh",
          "w-full overflow-x-hidden",
          enableTopSafePadding && "safe-top-enhanced",
          isMobile && isIOS && "safe-x safe-y",
          isMobile && !isIOS && "safe-x"
        );
      case 'content':
        return cn(
          maxWidthClasses[maxWidth],
          "mx-auto px-4 py-8",
          enableTopSafePadding && "safe-top-content",
          isMobile && "px-4 py-6",
          "mobile-content-spacing"
        );
      case 'section':
        return cn(
          "w-full",
          spacingClasses[spacing]
        );
      default:
        return "";
    }
  };

  return (
    <div className={cn(getVariantClasses(), className)}>
      {children}
    </div>
  );
};

export default UnifiedContainer;
