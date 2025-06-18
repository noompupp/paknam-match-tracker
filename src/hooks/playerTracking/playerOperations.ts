
import { useState } from "react";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { convertProcessedPlayerToPlayerTime } from "@/types/playerTime";
import { PlayerHalfTimes } from "./types";

export const usePlayerOperations = () => {
  const [trackedPlayers, setTrackedPlayers] = useState<PlayerTime[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerHalfTimes, setPlayerHalfTimes] = useState<Map<number, PlayerHalfTimes>>(new Map());
  const [roleBasedStops, setRoleBasedStops] = useState<Map<number, boolean>>(new Map());

  const addPlayer = (player: ProcessedPlayer | PlayerTime, matchTime: number) => {
    console.log('🎯 PlayerOperations: Adding player:', { player, matchTime });
    
    if (!player) {
      console.warn('❌ PlayerOperations: Cannot add null/undefined player');
      return null;
    }

    // Check if player is already being tracked
    const existingPlayer = trackedPlayers.find(p => p.id === player.id);
    if (existingPlayer) {
      console.warn(`⚠️ PlayerOperations: Player ${player.name} is already being tracked`);
      return existingPlayer;
    }

    // Convert to PlayerTime if it's a ProcessedPlayer
    const newPlayerTime: PlayerTime = 'team_id' in player 
      ? convertProcessedPlayerToPlayerTime(player as ProcessedPlayer, matchTime)
      : player as PlayerTime;

    setTrackedPlayers(prev => {
      const updated = [...prev, newPlayerTime];
      console.log('✅ PlayerOperations: Updated tracked players:', updated.length);
      return updated;
    });
    
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
    
    console.log(`🎯 PlayerOperations: Successfully added ${player.name} to tracking`);
    return newPlayerTime;
  };

  const addMultiplePlayers = (players: ProcessedPlayer[], matchTime: number) => {
    console.log('🎯 PlayerOperations: Adding multiple players:', { playerCount: players.length, matchTime });
    
    const addedPlayers: PlayerTime[] = [];
    
    players.forEach(player => {
      const result = addPlayer(player, matchTime);
      if (result) {
        addedPlayers.push(result);
      }
    });
    
    console.log(`✅ PlayerOperations: Successfully added ${addedPlayers.length} players to tracking`);
    return addedPlayers;
  };

  const removePlayer = (playerId: number) => {
    console.log('🗑️ PlayerOperations: Removing player:', playerId);
    
    const player = trackedPlayers.find(p => p.id === playerId);
    setTrackedPlayers(prev => {
      const updated = prev.filter(p => p.id !== playerId);
      console.log('✅ PlayerOperations: Updated tracked players after removal:', updated.length);
      return updated;
    });
    
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
    console.log('⏯️ PlayerOperations: Toggling player time:', { playerId, matchTime });
    
    let updatedPlayer = null;
    setTrackedPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const newIsPlaying = !player.isPlaying;
        updatedPlayer = {
          ...player,
          isPlaying: newIsPlaying,
          startTime: newIsPlaying ? matchTime : null
        };

        console.log('✅ PlayerOperations: Player time toggled:', {
          playerId,
          newIsPlaying,
          playerName: player.name
        });

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
    console.log('🔄 PlayerOperations: Resetting all tracking');
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
    addMultiplePlayers,
    removePlayer,
    togglePlayerTime,
    resetTracking
  };
};
