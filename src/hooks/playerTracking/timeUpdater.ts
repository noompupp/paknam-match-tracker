
import { useEffect, useRef, useCallback } from "react";
import { PlayerTime } from "@/types/database";
import { TimerSynchronizer } from "./timerSynchronizer";

export const useTimeUpdater = (
  isTimerRunning: boolean,
  trackedPlayers: PlayerTime[],
  setTrackedPlayers: React.Dispatch<React.SetStateAction<PlayerTime[]>>,
  setPlayerHalfTimes: React.Dispatch<React.SetStateAction<Map<number, { firstHalf: number; secondHalf: number }>>>,
  matchTime: number
) => {
  const timerSynchronizer = useRef(TimerSynchronizer.getInstance());
  const hookId = useRef(`timer-${Date.now()}-${Math.random()}`);
  
  // Use refs to always get the latest values without stale closures
  const latestValues = useRef({
    isTimerRunning,
    trackedPlayers,
    matchTime,
    setTrackedPlayers,
    setPlayerHalfTimes
  });

  // Update refs with latest values
  useEffect(() => {
    latestValues.current = {
      isTimerRunning,
      trackedPlayers,
      matchTime,
      setTrackedPlayers,
      setPlayerHalfTimes
    };
  });

  // Memoized timer callback to prevent recreation on every render
  const timerCallback = useCallback(() => {
    const { 
      isTimerRunning: currentIsRunning, 
      trackedPlayers: currentPlayers, 
      matchTime: currentMatchTime,
      setTrackedPlayers: currentSetPlayers,
      setPlayerHalfTimes: currentSetHalfTimes
    } = latestValues.current;

    if (!currentIsRunning || currentPlayers.length === 0) {
      return;
    }

    console.log('🔄 Timer update tick - Fresh values:', {
      isRunning: currentIsRunning,
      playersCount: currentPlayers.length,
      matchTime: `${Math.floor(currentMatchTime / 60)}:${String(currentMatchTime % 60).padStart(2, '0')}`,
      activePlayers: currentPlayers.filter(p => p.isPlaying).length
    });

    // Update tracked players
    currentSetPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (player.isPlaying) {
          const newTotalTime = player.totalTime + 1;
          return { 
            ...player, 
            totalTime: newTotalTime
          };
        }
        return player;
      });
    });

    // Update half times with fresh data
    currentSetHalfTimes(prevHalfTimes => {
      const newMap = new Map(prevHalfTimes);
      const { updatedHalfTimes } = TimerSynchronizer.calculatePlayerTimeUpdates(
        currentPlayers,
        prevHalfTimes,
        currentMatchTime
      );
      return updatedHalfTimes;
    });
  }, []); // Empty dependency array since we use refs for latest values

  useEffect(() => {
    if (isTimerRunning) {
      console.log('🎯 Subscribing to timer synchronizer:', {
        hookId: hookId.current,
        playersCount: trackedPlayers.length,
        matchTime: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`
      });

      const unsubscribe = timerSynchronizer.current.subscribe(
        hookId.current,
        timerCallback
      );

      return unsubscribe;
    }
  }, [isTimerRunning, timerCallback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up timer subscriber:', hookId.current);
    };
  }, []);
};
