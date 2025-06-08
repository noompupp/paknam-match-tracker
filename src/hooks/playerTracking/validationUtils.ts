
import { PlayerTime } from "@/types/database";
import { PlayerValidationResult } from "./types";
import { getTimeStatus } from "./timeStatusCalculator";
import { validatePlaytime } from "@/utils/timeUtils";

export const getPlayersNeedingAttention = (
  trackedPlayers: PlayerTime[],
  allPlayers: any[],
  matchTime: number,
  playerHalfTimes: Map<number, { firstHalf: number; secondHalf: number }>
) => {
  return trackedPlayers.filter(player => {
    const playerInfo = allPlayers.find(p => p.id === player.id);
    const role = playerInfo?.role || 'Starter';
    const status = getTimeStatus(player, role, matchTime, playerHalfTimes);
    return status === 'critical' || status === 'exceeded' || status === 'insufficient';
  });
};

export const validateAllPlayers = (
  trackedPlayers: PlayerTime[],
  allPlayers: any[],
  playerHalfTimes: Map<number, { firstHalf: number; secondHalf: number }>,
  roleBasedStops: Map<number, boolean>
): PlayerValidationResult[] => {
  const validationResults = trackedPlayers.map(player => {
    const playerInfo = allPlayers.find(p => p.id === player.id);
    const role = playerInfo?.role as 'Captain' | 'S-class' | 'Starter' || 'Starter';
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
