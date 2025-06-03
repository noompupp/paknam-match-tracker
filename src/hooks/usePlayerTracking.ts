
import { useState, useEffect } from "react";
import { PlayerTime } from "@/types/database";

interface PlayerConstraints {
  maxTime: number;
  warningTime: number;
  recommendedSubTime: number;
}

export const usePlayerTracking = (isTimerRunning: boolean) => {
  const [trackedPlayers, setTrackedPlayers] = useState<PlayerTime[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");

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

  // Enhanced role-based time constraints
  const getRoleConstraints = (position: string): PlayerConstraints => {
    const constraints: Record<string, PlayerConstraints> = {
      'Goalkeeper': { 
        maxTime: 90 * 60, 
        warningTime: 85 * 60, 
        recommendedSubTime: 80 * 60 
      },
      'Defender': { 
        maxTime: 90 * 60, 
        warningTime: 80 * 60, 
        recommendedSubTime: 75 * 60 
      },
      'Midfielder': { 
        maxTime: 85 * 60, 
        warningTime: 75 * 60, 
        recommendedSubTime: 70 * 60 
      },
      'Forward': { 
        maxTime: 80 * 60, 
        warningTime: 70 * 60, 
        recommendedSubTime: 65 * 60 
      },
    };
    return constraints[position] || constraints['Midfielder'];
  };

  const getTimeStatus = (player: PlayerTime, position: string): 'normal' | 'warning' | 'critical' | 'exceeded' => {
    const constraints = getRoleConstraints(position);
    if (player.totalTime >= constraints.maxTime) return 'exceeded';
    if (player.totalTime >= constraints.warningTime) return 'critical';
    if (player.totalTime >= constraints.recommendedSubTime) return 'warning';
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
    setSelectedPlayer("");
    return newPlayerTime;
  };

  const removePlayer = (playerId: number) => {
    const player = trackedPlayers.find(p => p.id === playerId);
    setTrackedPlayers(prev => prev.filter(p => p.id !== playerId));
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
  };

  // Get players who need substitution based on their time and position
  const getPlayersNeedingSubstitution = (allPlayers: any[]) => {
    return trackedPlayers.filter(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id);
      const position = playerInfo?.position || 'Midfielder';
      const status = getTimeStatus(player, position);
      return status === 'critical' || status === 'exceeded';
    });
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
    getPlayersNeedingSubstitution
  };
};
