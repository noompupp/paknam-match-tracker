
import { useState, useEffect, useRef } from "react";

export const useMatchTimer = () => {
  const [matchTime, setMatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setMatchTime(0);
    setIsRunning(false);
  };

  // Enhanced time formatting for consistency across the app
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Additional formatting for dashboard display (showing minutes only for completed matches)
  const formatTimeForDashboard = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}'`;
  };

  return {
    matchTime,
    isRunning,
    toggleTimer,
    resetTimer,
    formatTime,
    formatTimeForDashboard,
    setMatchTime
  };
};
