
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
  const [roleBasedStops, setRoleBasedStops] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        setTrackedPlayers(prev => prev.map(player => {
          if (player.isPlaying) {
            const newTotalTime = player.totalTime + 1;
            return { 
              ...player, 
              totalTime: newTotalTime
            };
          }
          return player;
        }));

        // Update half times tracking
        setPlayerHalfTimes(prev => {
          const newMap = new Map(prev);
          trackedPlayers.forEach(player => {
            if (player.isPlaying) {
              const halfTimes = newMap.get(player.id) || { firstHalf: 0, secondHalf: 0 };
              const currentHalf = isSecondHalf(player.totalTime + 1) ? 2 : 1;
              
              if (currentHalf === 1) {
                halfTimes.firstHalf += 1;
              } else {
                halfTimes.secondHalf += 1;
              }
              
              newMap.set(player.id, halfTimes);
            }
          });
          return newMap;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTimerRunning, trackedPlayers]);

  // Enhanced role-based constraints checking using actual role field
  const getRoleConstraints = (role: string): PlayerConstraints => {
    const normalizedRole = role?.toLowerCase() || 'starter';
    
    console.log('🎯 Role constraints for:', { role, normalizedRole });
    
    switch (normalizedRole) {
      case 'captain':
        return { 
          maxPerHalf: null, 
          minTotal: 0, 
          warningPerHalf: null 
        };
      case 's-class':
        return { 
          maxPerHalf: 20 * 60, // 20 minutes per half
          minTotal: 0, 
          warningPerHalf: 16 * 60 // Warning at 16 minutes (80% of limit)
        };
      case 'starter':
        return { 
          maxPerHalf: null, 
          minTotal: 10 * 60, // Minimum 10 minutes total
          warningPerHalf: null 
        };
      default:
        console.warn('⚠️ Unknown role, defaulting to Starter constraints:', role);
        return { 
          maxPerHalf: null, 
          minTotal: 10 * 60, // Default to Starter constraints
          warningPerHalf: null 
        };
    }
  };

  const getTimeStatus = (player: PlayerTime, role: string, matchTime: number): 'normal' | 'warning' | 'critical' | 'exceeded' | 'insufficient' => {
    const constraints = getRoleConstraints(role);
    const halfTimes = playerHalfTimes.get(player.id) || { firstHalf: 0, secondHalf: 0 };
    
    // Calculate current half time for this player
    const currentHalfTime = isSecondHalf(matchTime) ? halfTimes.secondHalf : halfTimes.firstHalf;
    
    console.log('🔍 Time status check:', {
      playerName: player.name,
      role,
      currentHalfTime,
      totalTime: player.totalTime,
      constraints
    });
    
    // Check S-class per-half limits
    if (role.toLowerCase() === 's-class' && constraints.maxPerHalf) {
      if (currentHalfTime >= constraints.maxPerHalf) {
        console.log('🚨 S-Class limit exceeded:', player.name);
        return 'exceeded';
      }
      if (constraints.warningPerHalf && currentHalfTime >= constraints.warningPerHalf) {
        console.log('⚠️ S-Class warning threshold reached:', player.name);
        return 'critical';
      }
    }
    
    // Check Starter minimum total time (only relevant near end of match)
    if (role.toLowerCase() === 'starter' && constraints.minTotal) {
      const remainingTime = SEVEN_A_SIDE_CONSTANTS.STANDARD_MATCH_DURATION - matchTime;
      if (remainingTime < 300 && player.totalTime < constraints.minTotal) { // 5 minutes remaining
        console.log('⚠️ Starter minimum time warning:', player.name);
        return 'insufficient';
      }
    }
    
    return 'normal';
  };

  // Enhanced add player with role tracking
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

    // Initialize role-based stop tracking
    setRoleBasedStops(prev => {
      const newMap = new Map(prev);
      newMap.set(player.id, false);
      return newMap;
    });
    
    setSelectedPlayer("");
    
    console.log(`🎯 Role-based timer: Added ${player.name} (${player.role || 'Starter'}) to tracking`);
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

    // Remove role-based stop tracking
    setRoleBasedStops(prev => {
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

        // Clear role-based stop when manually toggling
        if (newIsPlaying) {
          setRoleBasedStops(prevStops => {
            const newMap = new Map(prevStops);
            newMap.set(playerId, false);
            return newMap;
          });
        }

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
    setRoleBasedStops(new Map());
  };

  // Get players who need attention based on 7-a-side rules using role field
  const getPlayersNeedingAttention = (allPlayers: any[], matchTime: number) => {
    return trackedPlayers.filter(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id);
      const role = playerInfo?.role || 'Starter'; // Use role field instead of position
      const status = getTimeStatus(player, role, matchTime);
      return status === 'critical' || status === 'exceeded' || status === 'insufficient';
    });
  };

  // Enhanced validation with role-based logic using role field
  const validateAllPlayers = (allPlayers: any[], matchTime: number) => {
    const validationResults = trackedPlayers.map(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id);
      const role = playerInfo?.role as 'Captain' | 'S-class' | 'Starter' || 'Starter'; // Use role field
      const halfTimes = playerHalfTimes.get(player.id) || { firstHalf: 0, secondHalf: 0 };
      const wasAutoStopped = roleBasedStops.get(player.id) || false;
      
      return {
        player,
        role,
        wasAutoStopped,
        validation: validatePlaytime(player.totalTime, halfTimes.firstHalf, halfTimes.secondHalf, role)
      };
    });
    
    return validationResults;
  };

  // Get role-based timer notifications using role field
  const getRoleBasedNotifications = (allPlayers: any[], matchTime: number) => {
    const notifications: Array<{
      playerId: number;
      playerName: string;
      role: string;
      type: 'warning' | 'limit_reached' | 'auto_stopped' | 'minimum_needed';
      message: string;
    }> = [];

    trackedPlayers.forEach(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id);
      const role = playerInfo?.role || 'Starter'; // Use role field instead of position
      const status = getTimeStatus(player, role, matchTime);
      const wasAutoStopped = roleBasedStops.get(player.id) || false;

      console.log('🔔 Notification check:', {
        playerName: player.name,
        role,
        status,
        wasAutoStopped
      });

      if (wasAutoStopped) {
        notifications.push({
          playerId: player.id,
          playerName: player.name,
          role,
          type: 'auto_stopped',
          message: `${player.name} was automatically substituted (S-Class 20min limit reached)`
        });
      } else if (status === 'critical') {
        notifications.push({
          playerId: player.id,
          playerName: player.name,
          role,
          type: 'warning',
          message: `${player.name} approaching ${role} time limit`
        });
      } else if (status === 'insufficient') {
        notifications.push({
          playerId: player.id,
          playerName: player.name,
          role,
          type: 'minimum_needed',
          message: `${player.name} needs more playing time (Starter minimum: 10min)`
        });
      }
    });

    console.log('🔔 Generated notifications:', notifications);
    return notifications;
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
    validateAllPlayers,
    getRoleBasedNotifications,
    playerHalfTimes,
    roleBasedStops
  };
};
