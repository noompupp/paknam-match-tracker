
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

// Accept t as argument
export const validatePlayerCount = (
  trackedPlayers: PlayerTime[],
  t: (key: string, defaultMsg?: string, params?: Record<string, any>) => string = (k, d, params) => d || k
): PlayerCountValidation => {
  const activePlayers = trackedPlayers.filter(player => player.isPlaying);
  const activeCount = activePlayers.length;

  if (activeCount < MINIMUM_PLAYERS_ON_FIELD) {
    return {
      isValid: false,
      activeCount,
      requiredCount: MINIMUM_PLAYERS_ON_FIELD,
      message: t(
        "referee.tooFewPlayersOnField",
        `Only {count} players on field. Need at least {required} players.`,
        { count: activeCount, required: MINIMUM_PLAYERS_ON_FIELD }
      ),
      severity: 'error'
    };
  }

  if (activeCount > MAXIMUM_PLAYERS_ON_FIELD) {
    return {
      isValid: false,
      activeCount,
      requiredCount: MAXIMUM_PLAYERS_ON_FIELD,
      message: t(
        "referee.tooManyPlayersOnField",
        `{count} players on field. Maximum allowed is {required}.`,
        { count: activeCount, required: MAXIMUM_PLAYERS_ON_FIELD }
      ),
      severity: 'error'
    };
  }

  return {
    isValid: true,
    activeCount,
    requiredCount: MAXIMUM_PLAYERS_ON_FIELD,
    message: t(
      "referee.playersOnFieldPerfect",
      `{count} players on field - Perfect!`,
      { count: activeCount }
    ),
    severity: 'info'
  };
};

// Accept t as argument
export const validateTeamLock = (
  trackedPlayers: PlayerTime[],
  t: (key: string, defaultMsg?: string, params?: Record<string, any>) => string = (k, d, params) => d || k
): TeamLockValidation => {
  if (trackedPlayers.length === 0) {
    return {
      isLocked: false,
      lockedTeam: null,
      canAddFromTeam: () => true,
      message: t("referee.teamLockNone"),
    };
  }

  const firstPlayerTeam = trackedPlayers[0].team;
  const allFromSameTeam = trackedPlayers.every(player => player.team === firstPlayerTeam);
  if (!allFromSameTeam) {
    return {
      isLocked: false,
      lockedTeam: null,
      canAddFromTeam: () => true,
      message: t("referee.teamLockMultipleTeams"),
    };
  }

  return {
    isLocked: true,
    lockedTeam: firstPlayerTeam,
    canAddFromTeam: (team: string) => team === firstPlayerTeam,
    message: t("referee.teamLockStatus", undefined, { team: firstPlayerTeam }),
  };
};

export const canRemovePlayer = (
  playerId: number, 
  trackedPlayers: PlayerTime[],
  t: (key: string, defaultMsg?: string, params?: Record<string, any>) => string = (k, d, params) => d || k
): { canRemove: boolean; reason?: string } => {
  const player = trackedPlayers.find(p => p.id === playerId);
  if (!player) {
    return { canRemove: false, reason: t("referee.playerNotFound") };
  }

  if (!player.isPlaying) {
    // Can always remove players who are not currently playing
    return { canRemove: true };
  }

  const activePlayers = trackedPlayers.filter(p => p.isPlaying);
  if (activePlayers.length <= MINIMUM_PLAYERS_ON_FIELD) {
    return { 
      canRemove: false, 
      reason: t(
        "referee.removeLeavesTooFew",
        "Cannot remove player - would leave only {remaining} players on field (minimum: {required})",
        { remaining: activePlayers.length - 1, required: MINIMUM_PLAYERS_ON_FIELD }
      )
    };
  }

  return { canRemove: true };
};

export const canAddPlayer = (
  newPlayerTeam: string,
  trackedPlayers: PlayerTime[],
  t: (key: string, defaultMsg?: string, params?: Record<string, any>) => string = (k, d, params) => d || k
): { canAdd: boolean; reason?: string } => {
  // Check team lock
  const teamLock = validateTeamLock(trackedPlayers, t);
  if (teamLock.isLocked && !teamLock.canAddFromTeam(newPlayerTeam)) {
    return {
      canAdd: false,
      reason: t(
        "referee.teamLockStatus",
        "Cannot add player from {team}. Currently tracking {lockedTeam} players only.",
        { team: newPlayerTeam, lockedTeam: teamLock.lockedTeam }
      )
    };
  }

  // Check maximum players
  if (trackedPlayers.length >= 15) {
    return {
      canAdd: false,
      reason: t('referee.maxTrackedPlayers', 'Maximum number of tracked players reached (15).')
    };
  }

  return { canAdd: true };
};

export const getSubstitutionRequiredMessage = (
  activeCount: number,
  t: (key: string, defaultMsg?: string, params?: Record<string, any>) => string = (k, d, params) => d || k
): string | null => {
  if (activeCount < MINIMUM_PLAYERS_ON_FIELD) {
    const needed = MINIMUM_PLAYERS_ON_FIELD - activeCount;
    return t(
      "referee.needMorePlayersOnField",
      "Need {needed} more player{plural} on field to continue.",
      { needed, plural: needed > 1 ? 's' : '' }
    );
  }
  return null;
};
