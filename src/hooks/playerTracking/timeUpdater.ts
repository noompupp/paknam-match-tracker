
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

  // Memoized timer callback with ENHANCED debugging
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
    
    console.log('🔄 Timer Tick - ENHANCED debugging for S-Class bug:', {
      isRunning: currentIsRunning,
      playersCount: currentPlayers.length,
      activePlayersCount: activePlayersForDebugging.length,
      matchTime: currentMatchTime,
      matchTimeFormatted: `${Math.floor(currentMatchTime / 60)}:${String(currentMatchTime % 60).padStart(2, '0')}`,
      activePlayers: activePlayersForDebugging.map(p => ({
        id: p.id,
        name: p.name,
        totalTime: p.totalTime,
        isPlaying: p.isPlaying,
        totalTimeFormatted: `${Math.floor(p.totalTime / 60)}:${String(p.totalTime % 60).padStart(2, '0')}`
      }))
    });

    // Update tracked players with detailed logging
    currentSetPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (player.isPlaying) {
          const newTotalTime = player.totalTime + 1;
          
          console.log('⏱️ Timer Update - Player time increment:', {
            playerId: player.id,
            playerName: player.name,
            oldTotalTime: player.totalTime,
            newTotalTime,
            increment: 1,
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
    });

    // Update half times with fresh data and enhanced logging
    currentSetHalfTimes(prevHalfTimes => {
      const newMap = new Map(prevHalfTimes);
      const { updatedHalfTimes } = TimerSynchronizer.calculatePlayerTimeUpdates(
        currentPlayers,
        prevHalfTimes,
        currentMatchTime
      );
      
      console.log('📊 Timer Update - Half times update:', {
        originalMapSize: prevHalfTimes.size,
        updatedMapSize: updatedHalfTimes.size,
        matchTime: currentMatchTime,
        matchTimeFormatted: `${Math.floor(currentMatchTime / 60)}:${String(currentMatchTime % 60).padStart(2, '0')}`,
        playersWithHalfTimes: Array.from(updatedHalfTimes.entries()).map(([id, times]) => ({
          playerId: id,
          firstHalf: `${Math.floor(times.firstHalf / 60)}:${String(times.firstHalf % 60).padStart(2, '0')}`,
          secondHalf: `${Math.floor(times.secondHalf / 60)}:${String(times.secondHalf % 60).padStart(2, '0')}`
        }))
      });
      
      return updatedHalfTimes;
    });
  }, []); // Empty dependency array since we use refs for latest values

  useEffect(() => {
    if (isTimerRunning) {
      console.log('🎯 Timer Subscription - Enhanced with S-Class debugging:', {
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
