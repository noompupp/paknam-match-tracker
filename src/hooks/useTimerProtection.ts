
import { useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseTimerProtectionProps {
  isTimerRunning: boolean
  hasActiveTracking: boolean
  onForceStop?: () => void
}

export const useTimerProtection = ({ 
  isTimerRunning, 
  hasActiveTracking, 
  onForceStop 
}: UseTimerProtectionProps) => {
  const { toast } = useToast()

  const checkProtection = useCallback(() => {
    return isTimerRunning || hasActiveTracking
  }, [isTimerRunning, hasActiveTracking])

  const showProtectionWarning = useCallback(() => {
    toast({
      title: "Timer Active",
      description: "Please stop the timer and player tracking before switching tabs",
      variant: "destructive",
    })
  }, [toast])

  const showNavigationWarning = useCallback((event: BeforeUnloadEvent) => {
    if (checkProtection()) {
      const message = "You have an active timer or player tracking. Are you sure you want to leave?"
      event.preventDefault()
      event.returnValue = message
      return message
    }
  }, [checkProtection])

  useEffect(() => {
    if (checkProtection()) {
      window.addEventListener('beforeunload', showNavigationWarning)
      return () => window.removeEventListener('beforeunload', showNavigationWarning)
    }
  }, [checkProtection, showNavigationWarning])

  return {
    isProtected: checkProtection(),
    showWarning: showProtectionWarning,
    canNavigate: !checkProtection()
  }
}
