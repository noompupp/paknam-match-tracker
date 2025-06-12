
import { useState, useCallback, useRef, useEffect } from 'react';
import { PlayerTime } from '@/types/database';

interface LocalTimerConfig {
  updateInterval: number; // milliseconds
  autoSaveThreshold: number; // seconds of playtime before auto-save
}

export const useLocalTimerState = (config: LocalTimerConfig = {
  updateInterval: 1000, // 1 second
  autoSaveThreshold: 300 // 5 minutes
}) => {
  const [localPlayerTimes, setLocalPlayerTimes] = useState<Map<number, PlayerTime>>(new Map());
  const [isTimerActive, setIsTimerActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastAutoSaveRef = useRef<Map<number, number>>(new Map());

  const startLocalTimer = useCallback(() => {
    if (intervalRef.current) return; // Already running

    setIsTimerActive(true);
    
    intervalRef.current = setInterval(() => {
      setLocalPlayerTimes(prev => {
        const updated = new Map(prev);
        const now = Date.now();
        
        for (const [playerId, playerTime] of updated) {
          if (playerTime.isPlaying) {
            // Update total time locally
            updated.set(playerId, {
              ...playerTime,
              totalTime: playerTime.totalTime + 1
            });

            // Check if auto-save threshold reached
            const lastAutoSave = lastAutoSaveRef.current.get(playerId) || 0;
            const timeSinceAutoSave = (now - lastAutoSave) / 1000;
            
            if (timeSinceAutoSave >= config.autoSaveThreshold) {
              lastAutoSaveRef.current.set(playerId, now);
              console.log(`⏰ LocalTimer: Auto-save threshold reached for player ${playerId}`);
              // Trigger auto-save callback if provided
              // This will be handled by the sync manager
            }
          }
        }
        
        return updated;
      });
    }, config.updateInterval);

    console.log('▶️ LocalTimer: Started with', config.updateInterval / 1000, 'second intervals');
  }, [config.updateInterval, config.autoSaveThreshold]);

  const stopLocalTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsTimerActive(false);
    console.log('⏹️ LocalTimer: Stopped');
  }, []);

  const addPlayerToLocalTimer = useCallback((playerTime: PlayerTime) => {
    setLocalPlayerTimes(prev => {
      const updated = new Map(prev);
      updated.set(playerTime.playerId, {
        ...playerTime,
        startTime: playerTime.isPlaying ? Date.now() : playerTime.startTime
      });
      return updated;
    });
    
    console.log('➕ LocalTimer: Added player', playerTime.playerName);
  }, []);

  const removePlayerFromLocalTimer = useCallback((playerId: number) => {
    setLocalPlayerTimes(prev => {
      const updated = new Map(prev);
      updated.delete(playerId);
      lastAutoSaveRef.current.delete(playerId);
      return updated;
    });
    
    console.log('➖ LocalTimer: Removed player', playerId);
  }, []);

  const togglePlayerInLocalTimer = useCallback((playerId: number) => {
    setLocalPlayerTimes(prev => {
      const updated = new Map(prev);
      const player = updated.get(playerId);
      
      if (player) {
        const now = Date.now();
        const isNowPlaying = !player.isPlaying;
        
        let updatedPlayer = {
          ...player,
          isPlaying: isNowPlaying
        };

        if (isNowPlaying) {
          // Starting to play
          updatedPlayer.startTime = now;
        } else {
          // Stopping play - calculate session time
          const sessionTime = player.startTime ? Math.floor((now - player.startTime) / 1000) : 0;
          updatedPlayer.totalTime += sessionTime;
          updatedPlayer.startTime = null;
          
          // Add period record
          if (player.startTime) {
            updatedPlayer.periods = [
              ...(player.periods || []),
              {
                start_time: player.startTime,
                end_time: now,
                duration: sessionTime
              }
            ];
          }
        }
        
        updated.set(playerId, updatedPlayer);
        console.log('🔄 LocalTimer: Toggled player', playerId, isNowPlaying ? 'ON' : 'OFF');
      }
      
      return updated;
    });
  }, []);

  const getLocalPlayerTime = useCallback((playerId: number): PlayerTime | undefined => {
    return localPlayerTimes.get(playerId);
  }, [localPlayerTimes]);

  const getAllLocalPlayerTimes = useCallback((): PlayerTime[] => {
    return Array.from(localPlayerTimes.values());
  }, [localPlayerTimes]);

  const getPlayingPlayersCount = useCallback((): number => {
    return Array.from(localPlayerTimes.values()).filter(p => p.isPlaying).length;
  }, [localPlayerTimes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    localPlayerTimes: getAllLocalPlayerTimes(),
    isTimerActive,
    startLocalTimer,
    stopLocalTimer,
    addPlayerToLocalTimer,
    removePlayerFromLocalTimer,
    togglePlayerInLocalTimer,
    getLocalPlayerTime,
    getPlayingPlayersCount
  };
};
