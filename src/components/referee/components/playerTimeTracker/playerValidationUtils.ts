
import { PlayerTime } from "@/types/database";

export interface PlayerCountValidation {
  isValid: boolean;
  activeCount: number;
  requiredCount: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface TeamLockValidation {
  isLocked: boolean;
  lockedTeam: string | null;
  canAddFromTeam: (team: string) => boolean;
  message: string;
}

export const MINIMUM_PLAYERS_ON_FIELD = 7;
export const MAXIMUM_PLAYERS_ON_FIELD = 7;

export const validatePlayerCount = (trackedPlayers: PlayerTime[]): PlayerCountValidation => {
  const activePlayers = trackedPlayers.filter(player => player.isPlaying);
  const activeCount = activePlayers.length;

  if (activeCount < MINIMUM_PLAYERS_ON_FIELD) {
    return {
      isValid: false,
      activeCount,
      requiredCount: MINIMUM_PLAYERS_ON_FIELD,
      message: `Only ${activeCount} players on field. Need at least ${MINIMUM_PLAYERS_ON_FIELD} players.`,
      severity: 'error'
    };
  }

  if (activeCount > MAXIMUM_PLAYERS_ON_FIELD) {
    return {
      isValid: false,
      activeCount,
      requiredCount: MAXIMUM_PLAYERS_ON_FIELD,
      message: `${activeCount} players on field. Maximum allowed is ${MAXIMUM_PLAYERS_ON_FIELD}.`,
      severity: 'error'
    };
  }

  return {
    isValid: true,
    activeCount,
    requiredCount: MAXIMUM_PLAYERS_ON_FIELD,
    message: `${activeCount} players on field - Perfect!`,
    severity: 'info'
  };
};

export const validateTeamLock = (trackedPlayers: PlayerTime[]): TeamLockValidation => {
  if (trackedPlayers.length === 0) {
    return {
      isLocked: false,
      lockedTeam: null,
      canAddFromTeam: () => true,
      message: 'No team lock active. You can track players from any team.'
    };
  }

  // Get the team of the first tracked player
  const firstPlayerTeam = trackedPlayers[0].team;
  
  // Check if all tracked players are from the same team
  const allFromSameTeam = trackedPlayers.every(player => player.team === firstPlayerTeam);
  
  if (!allFromSameTeam) {
    // This shouldn't happen with proper validation, but handle it gracefully
    return {
      isLocked: false,
      lockedTeam: null,
      canAddFromTeam: () => true,
      message: 'Warning: Players from multiple teams detected. Team lock disabled.'
    };
  }

  return {
    isLocked: true,
    lockedTeam: firstPlayerTeam,
    canAddFromTeam: (team: string) => team === firstPlayerTeam,
    message: `Team lock active: Only tracking ${firstPlayerTeam} players.`
  };
};

export const canRemovePlayer = (
  playerId: number, 
  trackedPlayers: PlayerTime[]
): { canRemove: boolean; reason?: string } => {
  const player = trackedPlayers.find(p => p.id === playerId);
  if (!player) {
    return { canRemove: false, reason: 'Player not found' };
  }

  if (!player.isPlaying) {
    // Can always remove players who are not currently playing
    return { canRemove: true };
  }

  const activePlayers = trackedPlayers.filter(p => p.isPlaying);
  
  if (activePlayers.length <= MINIMUM_PLAYERS_ON_FIELD) {
    return { 
      canRemove: false, 
      reason: `Cannot remove player - would leave only ${activePlayers.length - 1} players on field (minimum: ${MINIMUM_PLAYERS_ON_FIELD})` 
    };
  }

  return { canRemove: true };
};

export const canAddPlayer = (
  newPlayerTeam: string,
  trackedPlayers: PlayerTime[]
): { canAdd: boolean; reason?: string } => {
  // Check team lock
  const teamLock = validateTeamLock(trackedPlayers);
  if (teamLock.isLocked && !teamLock.canAddFromTeam(newPlayerTeam)) {
    return {
      canAdd: false,
      reason: `Cannot add player from ${newPlayerTeam}. Currently tracking ${teamLock.lockedTeam} players only.`
    };
  }

  // Check maximum players
  if (trackedPlayers.length >= 15) { // Reasonable maximum for tracking
    return {
      canAdd: false,
      reason: 'Maximum number of tracked players reached (15).'
    };
  }

  return { canAdd: true };
};

export const getSubstitutionRequiredMessage = (activeCount: number): string | null => {
  if (activeCount < MINIMUM_PLAYERS_ON_FIELD) {
    const needed = MINIMUM_PLAYERS_ON_FIELD - activeCount;
    return `Need ${needed} more player${needed > 1 ? 's' : ''} on field to continue.`;
  }
  return null;
};
