
import { useState, useEffect, useRef } from "react";
import { formatMatchTime, formatTimeForDashboard } from "@/utils/timeUtils";

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

  // Use centralized formatting functions
  const formatTime = (seconds: number) => formatMatchTime(seconds);
  const formatTimeForDashboard = (seconds: number) => formatTimeForDashboard(seconds);

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
