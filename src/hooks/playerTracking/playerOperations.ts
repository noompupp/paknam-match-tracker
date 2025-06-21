
import { useState } from "react";
import { PlayerTime } from "@/types/database";
import { PlayerHalfTimes } from "./types";
import { isSecondHalf } from "@/utils/timeUtils";

export const usePlayerOperations = () => {
  const [trackedPlayers, setTrackedPlayers] = useState<PlayerTime[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerHalfTimes, setPlayerHalfTimes] = useState<Map<number, PlayerHalfTimes>>(new Map());
  const [roleBasedStops, setRoleBasedStops] = useState<Map<number, boolean>>(new Map());

  const addPlayer = (player: any, matchTime: number) => {
    if (!player) {
      console.warn('❌ PlayerOperations: Cannot add player - player is null/undefined');
      return null;
    }

    // Check if player is already being tracked
    const existingPlayer = trackedPlayers.find(p => p.id === player.id);
    if (existingPlayer) {
      console.warn(`⚠️ PlayerOperations: Player ${player.name} is already being tracked`);
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

    console.log('✅ PlayerOperations - Adding player with debugging:', {
      playerId: player.id,
      playerName: player.name,
      playerRole: (player as any).role || 'Starter',
      matchTime,
      matchTimeFormatted: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`,
      currentHalf: isSecondHalf(matchTime) ? 2 : 1,
      newPlayerTime
    });

    setTrackedPlayers(prev => [...prev, newPlayerTime]);
    
    // Initialize half times tracking with debugging
    setPlayerHalfTimes(prev => {
      const newMap = new Map(prev);
      const initialHalfTimes = { firstHalf: 0, secondHalf: 0 };
      newMap.set(player.id, initialHalfTimes);
      
      console.log('📊 PlayerOperations - Initialized half times for player:', {
        playerId: player.id,
        playerName: player.name,
        initialHalfTimes,
        mapSize: newMap.size
      });
      
      return newMap;
    });

    // Initialize role-based stop tracking
    setRoleBasedStops(prev => {
      const newMap = new Map(prev);
      newMap.set(player.id, false);
      return newMap;
    });
    
    setSelectedPlayer("");
    
    console.log(`🎯 PlayerOperations: Successfully added ${player.name} (${(player as any).role || 'Starter'}) to tracking`);
    return newPlayerTime;
  };

  const removePlayer = (playerId: number) => {
    const player = trackedPlayers.find(p => p.id === playerId);
    
    console.log('🗑️ PlayerOperations - Removing player:', {
      playerId,
      playerName: player?.name || 'Unknown',
      playerFound: !!player
    });
    
    setTrackedPlayers(prev => prev.filter(p => p.id !== playerId));
    
    // Remove half times tracking
    setPlayerHalfTimes(prev => {
      const newMap = new Map(prev);
      newMap.delete(playerId);
      
      console.log('📊 PlayerOperations - Removed half times for player:', {
        playerId,
        mapSizeAfter: newMap.size
      });
      
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
    console.log('⏱️ PlayerOperations - Toggle player time with FULL debugging:', {
      playerId,
      matchTime,
      matchTimeFormatted: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`,
      currentHalf: isSecondHalf(matchTime) ? 2 : 1,
      trackedPlayersCount: trackedPlayers.length,
      halfTimesMapSize: playerHalfTimes.size
    });

    let updatedPlayer = null;
    setTrackedPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const newIsPlaying = !player.isPlaying;
        updatedPlayer = {
          ...player,
          isPlaying: newIsPlaying,
          startTime: newIsPlaying ? matchTime : null
        };

        console.log('🔄 PlayerOperations - Player toggle details:', {
          playerId,
          playerName: player.name,
          wasPlaying: player.isPlaying,
          nowPlaying: newIsPlaying,
          matchTime,
          newStartTime: updatedPlayer.startTime,
          totalTimeBefore: player.totalTime
        });

        // Clear role-based stop when manually toggling
        if (newIsPlaying) {
          setRoleBasedStops(prevStops => {
            const newMap = new Map(prevStops);
            newMap.set(playerId, false);
            
            console.log('🚫 PlayerOperations - Cleared role-based stop for player:', {
              playerId,
              playerName: player.name
            });
            
            return newMap;
          });
        }

        return updatedPlayer;
      }
      return player;
    }));

    // Log the final result
    if (updatedPlayer) {
      console.log('✅ PlayerOperations - Player toggle completed:', {
        playerId: updatedPlayer.id,
        playerName: updatedPlayer.name,
        isNowPlaying: updatedPlayer.isPlaying,
        startTime: updatedPlayer.startTime,
        totalTime: updatedPlayer.totalTime
      });
    } else {
      console.warn('❌ PlayerOperations - Player not found for toggle:', { playerId });
    }

    return updatedPlayer;
  };

  const resetTracking = () => {
    console.log('🔄 PlayerOperations - Resetting all tracking data');
    
    setTrackedPlayers([]);
    setSelectedPlayer("");
    setPlayerHalfTimes(new Map());
    setRoleBasedStops(new Map());
    
    console.log('✅ PlayerOperations - Reset completed');
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
