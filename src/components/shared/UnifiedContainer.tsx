
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { usePlatformDetection } from "@/hooks/usePlatformDetection";

interface UnifiedContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'page' | 'content' | 'section';
  spacing?: 'tight' | 'normal' | 'loose';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '7xl' | 'full';
}

const UnifiedContainer = ({
  children,
  className,
  variant = 'content',
  spacing = 'normal',
  maxWidth = '7xl'
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
          isMobile && isIOS && "safe-x safe-y",
          isMobile && !isIOS && "safe-x"
        );
      case 'content':
        return cn(
          maxWidthClasses[maxWidth],
          "mx-auto px-4 py-8",
          isMobile && "px-4 py-6",
          isMobile && "pb-safe-bottom mobile-safe-bottom"
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
    <div 
      className={cn(getVariantClasses(), className)}
      style={{
        background: variant === 'page' ? 'var(--app-gradient)' : undefined,
        backgroundAttachment: variant === 'page' ? 'fixed' : undefined,
        paddingLeft: isMobile ? `max(1rem, var(--safe-area-inset-left))` : undefined,
        paddingRight: isMobile ? `max(1rem, var(--safe-area-inset-right))` : undefined,
        paddingBottom: isMobile ? `max(2rem, calc(2rem + var(--mobile-nav-total-height)))` : undefined
      }}
    >
      {children}
    </div>
  );
};

export default UnifiedContainer;
