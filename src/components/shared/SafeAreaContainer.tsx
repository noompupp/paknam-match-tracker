
import React from "react"
import { cn } from "@/lib/utils"
import { usePlatformDetection } from "@/hooks/usePlatformDetection"

interface SafeAreaContainerProps {
  children: React.ReactNode
  className?: string
  enableTopPadding?: boolean
  enableBottomPadding?: boolean
  variant?: 'page' | 'content' | 'navigation' | 'modal'
}

const SafeAreaContainer = ({ 
  children, 
  className,
  enableTopPadding = true,
  enableBottomPadding = true,
  variant = 'content'
}: SafeAreaContainerProps) => {
  const { isMobile, isIOS } = usePlatformDetection();

  const getVariantClasses = () => {
    switch (variant) {
      case 'page':
        return cn(
          "min-h-screen w-full",
          enableTopPadding && "mobile-safe-page",
          enableBottomPadding && "safe-bottom",
          isMobile && isIOS && "safe-x"
        );
      case 'content':
        return cn(
          "w-full",
          enableTopPadding && "mobile-safe-header",
          enableBottomPadding && "pb-20 safe-bottom"
        );
      case 'modal':
        return cn(
          "w-full",
          enableTopPadding && "mobile-safe-modal",
          enableBottomPadding && "safe-bottom"
        );
      case 'navigation':
        return cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "safe-bottom"
        );
      default:
        return "";
    }
  };

  return (
    <div className={cn(getVariantClasses(), className)}>
      {children}
    </div>
  )
}

export default SafeAreaContainer
