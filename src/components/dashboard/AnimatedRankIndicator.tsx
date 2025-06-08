
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedRankIndicatorProps {
  currentPosition: number
  previousPosition?: number | null
  className?: string
}

const AnimatedRankIndicator = ({ 
  currentPosition, 
  previousPosition, 
  className 
}: AnimatedRankIndicatorProps) => {
  if (!previousPosition || previousPosition === currentPosition) {
    return (
      <div className={cn("flex items-center justify-center w-5 h-5", className)}>
        <Minus className="h-3 w-3 text-muted-foreground opacity-50" />
      </div>
    )
  }

  const isMovingUp = currentPosition < previousPosition
  const isMovingDown = currentPosition > previousPosition
  const positions = Math.abs(currentPosition - previousPosition)

  return (
    <div 
      className={cn(
        "flex items-center justify-center w-5 h-5 rounded-full transition-all duration-500 transform hover:scale-110",
        isMovingUp && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 animate-bounce",
        isMovingDown && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 animate-pulse",
        className
      )}
      title={`${isMovingUp ? 'Up' : 'Down'} ${positions} position${positions > 1 ? 's' : ''}`}
    >
      {isMovingUp && <TrendingUp className="h-3 w-3" />}
      {isMovingDown && <TrendingDown className="h-3 w-3" />}
    </div>
  )
}

export default AnimatedRankIndicator
