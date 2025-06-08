
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Timer, Users } from "lucide-react"
import { useTimerProtection } from "@/hooks/useTimerProtection"

interface TimerProtectionAlertProps {
  isTimerRunning: boolean
  hasActiveTracking: boolean
  onForceStop?: () => void
}

const TimerProtectionAlert = ({ 
  isTimerRunning, 
  hasActiveTracking, 
  onForceStop 
}: TimerProtectionAlertProps) => {
  const { isProtected } = useTimerProtection({
    isTimerRunning,
    hasActiveTracking,
    onForceStop
  })

  if (!isProtected) {
    return null
  }

  const getProtectionReason = () => {
    if (isTimerRunning && hasActiveTracking) {
      return "Timer running & players being tracked"
    } else if (isTimerRunning) {
      return "Match timer is running"
    } else if (hasActiveTracking) {
      return "Players are being tracked"
    }
    return "Active session"
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
      <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-amber-800 dark:text-amber-200">
            Navigation Protected
          </span>
          <Badge variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-300 dark:border-amber-700">
            {getProtectionReason()}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
          {isTimerRunning && <Timer className="h-3 w-3" />}
          {hasActiveTracking && <Users className="h-3 w-3" />}
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default TimerProtectionAlert
