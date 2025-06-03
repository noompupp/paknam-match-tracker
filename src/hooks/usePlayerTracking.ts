
import { useState, useEffect } from "react";
import { PlayerTime } from "@/types/database";
import { 
  SEVEN_A_SIDE_CONSTANTS, 
  isSecondHalf, 
  getCurrentHalfTime, 
  validatePlaytime 
} from "@/utils/timeUtils";

interface PlayerConstraints {
  maxPerHalf: number | null;
  minTotal: number;
  warningPerHalf: number | null;
}

export const usePlayerTracking = (isTimerRunning: boolean) => {
  const [trackedPlayers, setTrackedPlayers] = useState<PlayerTime[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerHalfTimes, setPlayerHalfTimes] = useState<Map<number, { firstHalf: number; secondHalf: number }>>(new Map());

  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        setTrackedPlayers(prev => prev.map(player => {
          if (player.isPlaying) {
            return { ...player, totalTime: player.totalTime + 1 };
          }
          return player;
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTimerRunning]);

  // Get role-based time constraints for 7-a-side
  const getRoleConstraints = (role: string): PlayerConstraints => {
    switch (role) {
      case 'Captain':
        return { 
          maxPerHalf: null, 
          minTotal: 0, 
          warningPerHalf: null 
        };
      case 'S-class':
        return { 
          maxPerHalf: 20 * 60, // 20 minutes per half
          minTotal: 0, 
          warningPerHalf: 16 * 60 // Warning at 16 minutes (80% of limit)
        };
      case 'Starter':
        return { 
          maxPerHalf: null, 
          minTotal: 10 * 60, // Minimum 10 minutes total
          warningPerHalf: null 
        };
      default:
        return { 
          maxPerHalf: null, 
          minTotal: 0, 
          warningPerHalf: null 
        };
    }
  };

  const getTimeStatus = (player: PlayerTime, role: string, matchTime: number): 'normal' | 'warning' | 'critical' | 'exceeded' | 'insufficient' => {
    const constraints = getRoleConstraints(role);
    const halfTimes = playerHalfTimes.get(player.id) || { firstHalf: 0, secondHalf: 0 };
    
    // Calculate current half time for this player
    const currentHalfTime = isSecondHalf(matchTime) ? halfTimes.secondHalf : halfTimes.firstHalf;
    
    // Check S-class per-half limits
    if (role === 'S-class' && constraints.maxPerHalf) {
      if (currentHalfTime >= constraints.maxPerHalf) return 'exceeded';
      if (constraints.warningPerHalf && currentHalfTime >= constraints.warningPerHalf) return 'critical';
    }
    
    // Check Starter minimum total time (only relevant near end of match)
    if (role === 'Starter' && constraints.minTotal) {
      const remainingTime = SEVEN_A_SIDE_CONSTANTS.STANDARD_MATCH_DURATION - matchTime;
      if (remainingTime < 300 && player.totalTime < constraints.minTotal) { // 5 minutes remaining
        return 'insufficient';
      }
    }
    
    return 'normal';
  };

  const addPlayer = (player: any, matchTime: number) => {
    if (!player) return null;

    // Check if player is already being tracked
    const existingPlayer = trackedPlayers.find(p => p.id === player.id);
    if (existingPlayer) {
      console.warn(`Player ${player.name} is already being tracked`);
      return null;
    }

    const newPlayerTime: PlayerTime = {
      id: player.id,
      name: player.name,
      team: player.team,
      totalTime: 0,
      isPlaying: true,
      startTime: matchTime
    };

    setTrackedPlayers(prev => [...prev, newPlayerTime]);
    
    // Initialize half times tracking
    setPlayerHalfTimes(prev => {
      const newMap = new Map(prev);
      newMap.set(player.id, { firstHalf: 0, secondHalf: 0 });
      return newMap;
    });
    
    setSelectedPlayer("");
    return newPlayerTime;
  };

  const removePlayer = (playerId: number) => {
    const player = trackedPlayers.find(p => p.id === playerId);
    setTrackedPlayers(prev => prev.filter(p => p.id !== playerId));
    
    // Remove half times tracking
    setPlayerHalfTimes(prev => {
      const newMap = new Map(prev);
      newMap.delete(playerId);
      return newMap;
    });
    
    return player;
  };

  const togglePlayerTime = (playerId: number, matchTime: number) => {
    let updatedPlayer = null;
    setTrackedPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const newIsPlaying = !player.isPlaying;
        updatedPlayer = {
          ...player,
          isPlaying: newIsPlaying,
          startTime: newIsPlaying ? matchTime : null
        };
        return updatedPlayer;
      }
      return player;
    }));
    return updatedPlayer;
  };

  const resetTracking = () => {
    setTrackedPlayers([]);
    setSelectedPlayer("");
    setPlayerHalfTimes(new Map());
  };

  // Get players who need attention based on 7-a-side rules
  const getPlayersNeedingAttention = (allPlayers: any[], matchTime: number) => {
    return trackedPlayers.filter(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id);
      const role = playerInfo?.position || 'Starter';
      const status = getTimeStatus(player, role, matchTime);
      return status === 'critical' || status === 'exceeded' || status === 'insufficient';
    });
  };

  // Validate all players against 7-a-side rules
  const validateAllPlayers = (allPlayers: any[], matchTime: number) => {
    const validationResults = trackedPlayers.map(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id);
      const role = playerInfo?.position as 'Captain' | 'S-class' | 'Starter' || 'Starter';
      const halfTimes = playerHalfTimes.get(player.id) || { firstHalf: 0, secondHalf: 0 };
      
      return {
        player,
        role,
        validation: validatePlaytime(player.totalTime, halfTimes.firstHalf, halfTimes.secondHalf, role)
      };
    });
    
    return validationResults;
  };

  return {
    trackedPlayers,
    selectedPlayer,
    setSelectedPlayer,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    resetTracking,
    getRoleConstraints,
    getTimeStatus,
    getPlayersNeedingAttention,
    validateAllPlayers
  };
};
