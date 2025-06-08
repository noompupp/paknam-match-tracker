
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface RealTimeRankIndicatorProps {
  currentPosition: number
  previousPosition?: number | null
  teamId?: number
  className?: string
}

const RealTimeRankIndicator = ({ 
  currentPosition, 
  previousPosition, 
  teamId,
  className 
}: RealTimeRankIndicatorProps) => {
  const [displayPosition, setDisplayPosition] = useState(currentPosition)
  const [animationKey, setAnimationKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Update display position when current position changes
  useEffect(() => {
    if (displayPosition !== currentPosition) {
      setIsAnimating(true)
      setAnimationKey(prev => prev + 1)
      
      // Delay the position update to show animation
      const timer = setTimeout(() => {
        setDisplayPosition(currentPosition)
        setIsAnimating(false)
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [currentPosition, displayPosition])

  if (!previousPosition || previousPosition === currentPosition) {
    return (
      <div className={cn("flex items-center justify-center w-5 h-5", className)}>
        <span className="text-muted-foreground opacity-50 text-sm">—</span>
      </div>
    )
  }

  const isMovingUp = currentPosition < previousPosition
  const isMovingDown = currentPosition > previousPosition
  const positions = Math.abs(currentPosition - previousPosition)

  return (
    <div 
      key={animationKey}
      className={cn(
        "flex items-center justify-center w-5 h-5 transition-all duration-300",
        isAnimating && "scale-110",
        "hover:scale-125 cursor-help",
        className
      )}
      title={`${isMovingUp ? 'Up' : 'Down'} ${positions} position${positions > 1 ? 's' : ''} (${previousPosition} → ${currentPosition})`}
    >
      {isMovingUp && (
        <span className={cn(
          "text-green-600 dark:text-green-400 text-base font-semibold transition-transform duration-300",
          isAnimating && "animate-bounce"
        )}>↑</span>
      )}
      {isMovingDown && (
        <span className={cn(
          "text-red-600 dark:text-red-400 text-base font-semibold transition-transform duration-300",
          isAnimating && "animate-pulse"
        )}>↓</span>
      )}
    </div>
  )
}

export default RealTimeRankIndicator
