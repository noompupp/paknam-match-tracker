
import { useEffect, useRef, useCallback } from "react";
import { PlayerTime } from "@/types/database";
import { TimerSynchronizer } from "./timerSynchronizer";
import { isSecondHalf } from "@/utils/timeUtils";

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

  // Enhanced timer callback with FIXED synchronization
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

    const activePlayersForDebugging = currentPlayers.filter(p => p.isPlaying);
    
    console.log('🔄 Timer Tick - FIXED S-Class synchronization:', {
      isRunning: currentIsRunning,
      playersCount: currentPlayers.length,
      activePlayersCount: activePlayersForDebugging.length,
      matchTime: currentMatchTime,
      matchTimeFormatted: `${Math.floor(currentMatchTime / 60)}:${String(currentMatchTime % 60).padStart(2, '0')}`,
      currentHalf: isSecondHalf(currentMatchTime) ? 2 : 1,
      activePlayers: activePlayersForDebugging.map(p => ({
        id: p.id,
        name: p.name,
        totalTime: p.totalTime,
        isPlaying: p.isPlaying
      }))
    });

    // CRITICAL FIX: Update both tracked players AND half times simultaneously
    currentSetPlayers(prevPlayers => {
      const updatedPlayers = prevPlayers.map(player => {
        if (player.isPlaying) {
          const newTotalTime = player.totalTime + 1;
          
          console.log('⏱️ Timer Update - Player increment (FIXED):', {
            playerId: player.id,
            playerName: player.name,
            oldTotalTime: player.totalTime,
            newTotalTime,
            oldTimeFormatted: `${Math.floor(player.totalTime / 60)}:${String(player.totalTime % 60).padStart(2, '0')}`,
            newTimeFormatted: `${Math.floor(newTotalTime / 60)}:${String(newTotalTime % 60).padStart(2, '0')}`
          });
          
          return { 
            ...player, 
            totalTime: newTotalTime
          };
        }
        return player;
      });

      // CRITICAL FIX: Update half times in the same tick
      currentSetHalfTimes(prevHalfTimes => {
        const newMap = new Map(prevHalfTimes);
        const currentHalf = isSecondHalf(currentMatchTime) ? 2 : 1;
        
        updatedPlayers.forEach(player => {
          if (player.isPlaying) {
            const halfTimes = newMap.get(player.id) || { firstHalf: 0, secondHalf: 0 };
            
            if (currentHalf === 1) {
              halfTimes.firstHalf += 1;
            } else {
              halfTimes.secondHalf += 1;
            }
            
            newMap.set(player.id, halfTimes);
            
            console.log('📊 Timer Update - Half times (FIXED SYNC):', {
              playerId: player.id,
              playerName: player.name,
              currentHalf,
              firstHalf: `${Math.floor(halfTimes.firstHalf / 60)}:${String(halfTimes.firstHalf % 60).padStart(2, '0')}`,
              secondHalf: `${Math.floor(halfTimes.secondHalf / 60)}:${String(halfTimes.secondHalf % 60).padStart(2, '0')}`,
              totalTime: `${Math.floor(player.totalTime / 60)}:${String(player.totalTime % 60).padStart(2, '0')}`,
              matchTime: `${Math.floor(currentMatchTime / 60)}:${String(currentMatchTime % 60).padStart(2, '0')}`
            });
          }
        });
        
        return newMap;
      });

      return updatedPlayers;
    });
  }, []); // Empty dependency array since we use refs for latest values

  useEffect(() => {
    if (isTimerRunning) {
      console.log('🎯 Timer Subscription - FIXED S-Class synchronization:', {
        hookId: hookId.current,
        playersCount: trackedPlayers.length,
        activePlayersCount: trackedPlayers.filter(p => p.isPlaying).length,
        matchTime: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`,
        trackedPlayerNames: trackedPlayers.map(p => `${p.name}(${p.isPlaying ? 'ON' : 'OFF'})`)
      });

      const unsubscribe = timerSynchronizer.current.subscribe(
        hookId.current,
        timerCallback
      );

      return unsubscribe;
    } else {
      console.log('⏸️ Timer Not Running - No subscription active');
    }
  }, [isTimerRunning, timerCallback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up timer subscriber:', hookId.current);
    };
  }, []);
};
