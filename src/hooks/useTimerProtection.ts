
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
      title: "Navigation Protected",
      description: "Timer is running or players are being tracked. Stop them before leaving.",
      variant: "destructive",
      duration: 5000
    })
  }, [toast])

  const showNavigationWarning = useCallback((event: BeforeUnloadEvent) => {
    if (checkProtection()) {
      const message = "You have an active timer or player tracking. Are you sure you want to leave?"
      event.preventDefault()
      event.returnValue = message
      
      // Show additional toast warning
      showProtectionWarning()
      return message
    }
  }, [checkProtection, showProtectionWarning])

  // Enhanced protection with multiple event listeners
  useEffect(() => {
    if (checkProtection()) {
      // Standard beforeunload protection
      window.addEventListener('beforeunload', showNavigationWarning)
      
      // Additional protection for programmatic navigation
      const handlePopState = (event: PopStateEvent) => {
        if (checkProtection()) {
          showProtectionWarning()
          // Prevent navigation by pushing the current state back
          window.history.pushState(null, '', window.location.href)
        }
      }
      
      window.addEventListener('popstate', handlePopState)
      
      // Push a dummy state to capture back button
      window.history.pushState(null, '', window.location.href)
      
      return () => {
        window.removeEventListener('beforeunload', showNavigationWarning)
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [checkProtection, showNavigationWarning, showProtectionWarning])

  return {
    isProtected: checkProtection(),
    showWarning: showProtectionWarning,
    canNavigate: !checkProtection()
  }
}
