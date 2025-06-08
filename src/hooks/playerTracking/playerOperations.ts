
import { useState } from "react";
import { PlayerTime } from "@/types/database";
import { PlayerHalfTimes } from "./types";
import { validateSubstitution } from "@/components/referee/components/playerTimeTracker/substitutionValidationUtils";

export const usePlayerOperations = () => {
  const [trackedPlayers, setTrackedPlayers] = useState<PlayerTime[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerHalfTimes, setPlayerHalfTimes] = useState<Map<number, PlayerHalfTimes>>(new Map());
  const [roleBasedStops, setRoleBasedStops] = useState<Map<number, boolean>>(new Map());

  const addPlayer = (player: any, matchTime: number) => {
    if (!player) return null;

    // Check if player is already being tracked
    const existingPlayer = trackedPlayers.find(p => p.id === player.id);
    if (existingPlayer) {
      console.warn(`Player ${player.name} is already being tracked`);
      return null;
    }

    // Enhanced validation using new substitution validation
    const validation = validateSubstitution('in', -1, trackedPlayers, player);
    
    if (!validation.canSubIn && validation.requiresSubstitution) {
      console.warn(`Cannot add ${player.name}: ${validation.reason}`);
      return { requiresSubstitution: true, validation };
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
    
    console.log(`🎯 Enhanced player operations: Added ${player.name} (${player.role || 'Starter'}) to tracking`);
    return newPlayerTime;
  };

  const removePlayer = (playerId: number) => {
    // Enhanced validation using new substitution validation
    const validation = validateSubstitution('out', playerId, trackedPlayers);
    
    if (!validation.canSubOut) {
      console.warn(`Cannot remove player ${playerId}: ${validation.reason}`);
      return { canRemove: false, reason: validation.reason };
    }

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
    // Enhanced validation using new substitution validation
    const validation = validateSubstitution('toggle', playerId, trackedPlayers);
    
    if (validation.requiresSubstitution && validation.actionType === 'substitute') {
      console.warn(`Toggle requires substitution for player ${playerId}: ${validation.reason}`);
      return { requiresSubstitution: true, validation };
    }

    if (!validation.canSubIn && !validation.canSubOut) {
      console.warn(`Cannot toggle player ${playerId}: ${validation.reason}`);
      return { canToggle: false, reason: validation.reason };
    }

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

  return {
    trackedPlayers,
    selectedPlayer,
    setSelectedPlayer,
    setTrackedPlayers,
    playerHalfTimes,
    setPlayerHalfTimes,
    roleBasedStops,
    setRoleBasedStops,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    resetTracking
  };
};
