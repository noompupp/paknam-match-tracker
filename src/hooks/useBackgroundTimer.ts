
import { useState, useEffect, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseBackgroundTimerOptions {
  onTimerTick?: (time: number) => void
  onTimerStart?: () => void
  onTimerStop?: () => void
  enableNotifications?: boolean
}

export const useBackgroundTimer = (options: UseBackgroundTimerOptions = {}) => {
  const { onTimerTick, onTimerStart, onTimerStop, enableNotifications = false } = options
  const { toast } = useToast()
  
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>()
  const pausedTimeRef = useRef<number>(0)

  // Background timer using Worker or fallback to setInterval
  const startBackgroundTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const startTime = Date.now() - pausedTimeRef.current * 1000
    startTimeRef.current = startTime

    intervalRef.current = setInterval(() => {
      const currentTime = Math.floor((Date.now() - startTime) / 1000)
      setTime(currentTime)
      onTimerTick?.(currentTime)
    }, 1000)
  }, [onTimerTick])

  const stopBackgroundTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
    pausedTimeRef.current = time
  }, [time])

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
      startBackgroundTimer()
      onTimerStart?.()
      
      if (enableNotifications) {
        toast({
          title: "Timer Started",
          description: "Match timer is now running in the background",
        })
      }
    }
  }, [isRunning, startBackgroundTimer, onTimerStart, enableNotifications, toast])

  const stop = useCallback(() => {
    if (isRunning) {
      setIsRunning(false)
      stopBackgroundTimer()
      onTimerStop?.()
      
      if (enableNotifications) {
        toast({
          title: "Timer Stopped",
          description: `Match stopped at ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`,
        })
      }
    }
  }, [isRunning, stopBackgroundTimer, onTimerStop, enableNotifications, toast, time])

  const reset = useCallback(() => {
    setIsRunning(false)
    stopBackgroundTimer()
    setTime(0)
    pausedTimeRef.current = 0
    
    if (enableNotifications) {
      toast({
        title: "Timer Reset",
        description: "Match timer has been reset to 00:00",
      })
    }
  }, [stopBackgroundTimer, enableNotifications, toast])

  const toggle = useCallback(() => {
    if (isRunning) {
      stop()
    } else {
      start()
    }
  }, [isRunning, start, stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Handle page visibility changes to maintain accurate timing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // Page is hidden, timer continues in background
        console.log('🕐 Timer continuing in background...')
      } else if (!document.hidden && isRunning && startTimeRef.current) {
        // Page is visible again, sync timer
        const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setTime(currentTime)
        onTimerTick?.(currentTime)
        console.log('🕐 Timer synced on page return:', currentTime)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isRunning, onTimerTick])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    time,
    isRunning,
    start,
    stop,
    reset,
    toggle,
    formatTime,
    // Computed values
    minutes: Math.floor(time / 60),
    seconds: time % 60,
    isFirstHalf: time <= 25 * 60,
    isSecondHalf: time > 25 * 60,
    currentHalf: time <= 25 * 60 ? 1 : 2,
    currentHalfTime: time <= 25 * 60 ? time : time - 25 * 60
  }
}
