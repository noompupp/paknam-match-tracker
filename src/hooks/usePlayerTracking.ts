
// Main export file for the refactored player tracking functionality
export { usePlayerOperations } from "./playerTracking/playerOperations";
export { useTimeUpdater } from "./playerTracking/timeUpdater";
export { useSubstitutionManager } from "./playerTracking/substitutionManager";
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
import { useSubstitutionManager } from "./playerTracking/substitutionManager";
import { generateRoleBasedNotifications } from "./playerTracking/notificationsGenerator";
import { getPlayersNeedingAttention } from "./playerTracking/validationUtils";

export const usePlayerTracking = (isTimerRunning: boolean, matchTime: number = 0) => {
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

  const substitutionManager = useSubstitutionManager();

  // Use the time updater with matchTime
  useTimeUpdater(isTimerRunning, trackedPlayers, setTrackedPlayers, setPlayerHalfTimes, matchTime);

  // Helper functions that use the extracted utilities
  const getPlayersNeedingAttentionForMatch = (allPlayers: any[], currentMatchTime: number) => {
    return getPlayersNeedingAttention(trackedPlayers, allPlayers, currentMatchTime, playerHalfTimes);
  };

  const getRoleBasedNotifications = (allPlayers: any[], currentMatchTime: number) => {
    return generateRoleBasedNotifications(trackedPlayers, allPlayers, currentMatchTime, playerHalfTimes, roleBasedStops);
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
    roleBasedStops,
    substitutionManager
  };
};
