
// Main export file for the refactored player tracking functionality
export { usePlayerOperations } from "./playerTracking/playerOperations";
export { useTimeUpdater } from "./playerTracking/timeUpdater";
export { getTimeStatus } from "./playerTracking/timeStatusCalculator";
export { generateRoleBasedNotifications } from "./playerTracking/notificationsGenerator";
export { getPlayersNeedingAttention, validateAllPlayers } from "./playerTracking/validationUtils";
export type { 
  PlayerConstraints,
  PlayerHalfTimes,
  RoleBasedNotification,
  TimeStatus,
  PlayerValidationResult
} from "./playerTracking/types";

// Main hook that combines all the functionality
import { usePlayerOperations } from "./playerTracking/playerOperations";
import { useTimeUpdater } from "./playerTracking/timeUpdater";
import { generateRoleBasedNotifications } from "./playerTracking/notificationsGenerator";
import { getPlayersNeedingAttention } from "./playerTracking/validationUtils";

export const usePlayerTracking = (isTimerRunning: boolean) => {
  const {
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
  } = usePlayerOperations();

  // Use the time updater
  useTimeUpdater(isTimerRunning, trackedPlayers, setTrackedPlayers, setPlayerHalfTimes);

  // Helper functions that use the extracted utilities
  const getPlayersNeedingAttentionForMatch = (allPlayers: any[], matchTime: number) => {
    return getPlayersNeedingAttention(trackedPlayers, allPlayers, matchTime, playerHalfTimes);
  };

  const getRoleBasedNotifications = (allPlayers: any[], matchTime: number) => {
    return generateRoleBasedNotifications(trackedPlayers, allPlayers, matchTime, playerHalfTimes, roleBasedStops);
  };

  return {
    trackedPlayers,
    selectedPlayer,
    setSelectedPlayer,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    resetTracking,
    getPlayersNeedingAttention: getPlayersNeedingAttentionForMatch,
    getRoleBasedNotifications,
    playerHalfTimes,
    roleBasedStops
  };
};
