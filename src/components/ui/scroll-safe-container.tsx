
import React from "react"
import { cn } from "@/lib/utils"

interface ScrollSafeContainerProps {
  children: React.ReactNode
  className?: string
  enableTopSafePadding?: boolean
  enableBottomSafePadding?: boolean
  customTopPadding?: string
  customBottomPadding?: string
}

const ScrollSafeContainer = ({ 
  children, 
  className,
  enableTopSafePadding = true,
  enableBottomSafePadding = true,
  customTopPadding,
  customBottomPadding
}: ScrollSafeContainerProps) => {
  return (
    <div 
      className={cn(
        "min-h-screen",
        enableTopSafePadding && !customTopPadding && "pt-safe-top",
        enableBottomSafePadding && !customBottomPadding && "pb-safe-bottom pb-20",
        className
      )}
      style={{
        paddingTop: customTopPadding || undefined,
        paddingBottom: customBottomPadding || undefined,
        // Prevent scroll flicker
        transform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {children}
    </div>
  )
}

export default ScrollSafeContainer
