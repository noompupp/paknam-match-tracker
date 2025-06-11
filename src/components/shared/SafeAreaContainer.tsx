
import React from "react"
import { cn } from "@/lib/utils"
import { usePlatformDetection } from "@/hooks/usePlatformDetection"

interface SafeAreaContainerProps {
  children: React.ReactNode
  className?: string
  enableTopPadding?: boolean
  enableBottomPadding?: boolean
  variant?: 'page' | 'content' | 'navigation'
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
          enableTopPadding && "safe-top-enhanced",
          enableBottomPadding && "safe-bottom",
          isMobile && isIOS && "safe-x"
        );
      case 'content':
        return cn(
          "w-full",
          enableTopPadding && "safe-top-content",
          enableBottomPadding && "pb-20 safe-bottom"
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
    <div 
      className={cn(getVariantClasses(), className)}
      style={{
        paddingTop: enableTopPadding && variant === 'page' 
          ? `max(1.5rem, env(safe-area-inset-top) + 1rem)` 
          : undefined,
        paddingBottom: enableBottomPadding && variant === 'navigation'
          ? `max(0.5rem, env(safe-area-inset-bottom))`
          : undefined
      }}
    >
      {children}
    </div>
  )
}

export default SafeAreaContainer
