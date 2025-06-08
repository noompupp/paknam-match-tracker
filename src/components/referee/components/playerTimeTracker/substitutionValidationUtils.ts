
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

export interface ReEntryValidation {
  needsForcedSubstitution: boolean;
  reason?: string;
  availableForSubstitution: PlayerTime[];
}

export interface SubstitutionValidation {
  canProceed: boolean;
  reason?: string;
  requiresSelection: boolean;
}

/**
 * Validates if a player re-entry requires forced substitution
 */
export const validateReEntry = (
  playerToReEnter: PlayerTime,
  trackedPlayers: PlayerTime[]
): ReEntryValidation => {
  // Check if player has already played (totalTime > 0)
  const hasPlayedBefore = playerToReEnter.totalTime > 0;
  
  if (!hasPlayedBefore) {
    return {
      needsForcedSubstitution: false,
      availableForSubstitution: []
    };
  }

  // Count currently active players
  const activePlayers = trackedPlayers.filter(p => p.isPlaying);
  
  if (activePlayers.length < 7) {
    return {
      needsForcedSubstitution: false,
      availableForSubstitution: []
    };
  }

  // If we have 7 active players and this is a re-entry, force substitution
  if (activePlayers.length >= 7) {
    const availableForSubstitution = activePlayers.filter(p => p.id !== playerToReEnter.id);
    
    return {
      needsForcedSubstitution: true,
      reason: `${playerToReEnter.name} has already played and cannot re-enter while 7 players are active. Please select a player to substitute out.`,
      availableForSubstitution
    };
  }

  return {
    needsForcedSubstitution: false,
    availableForSubstitution: []
  };
};

/**
 * Validates a substitution pairing
 */
export const validateSubstitution = (
  playerIn: PlayerTime,
  playerOut: PlayerTime,
  trackedPlayers: PlayerTime[]
): SubstitutionValidation => {
  // Basic validation
  if (playerIn.id === playerOut.id) {
    return {
      canProceed: false,
      reason: "Cannot substitute a player with themselves",
      requiresSelection: true
    };
  }

  if (!playerOut.isPlaying) {
    return {
      canProceed: false,
      reason: "Selected player is not currently active",
      requiresSelection: true
    };
  }

  if (playerIn.isPlaying) {
    return {
      canProceed: false,
      reason: "Player is already active",
      requiresSelection: false
    };
  }

  // Check minimum players after substitution
  const activeCount = trackedPlayers.filter(p => p.isPlaying).length;
  if (activeCount <= 1) {
    return {
      canProceed: false,
      reason: "Cannot substitute - would leave insufficient players on field",
      requiresSelection: true
    };
  }

  return {
    canProceed: true,
    requiresSelection: false
  };
};

/**
 * Gets players available for substitution out
 */
export const getPlayersAvailableForSubstitution = (
  trackedPlayers: PlayerTime[],
  excludePlayerId?: number
): PlayerTime[] => {
  return trackedPlayers.filter(player => 
    player.isPlaying && 
    (excludePlayerId ? player.id !== excludePlayerId : true)
  );
};
