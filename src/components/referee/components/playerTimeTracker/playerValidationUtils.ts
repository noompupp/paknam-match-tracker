
import { PlayerTime } from "@/types/playerTime";

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface TeamLockValidation {
  isLocked: boolean;
  lockedTeam?: string;
}

interface RemovalValidation {
  canRemove: boolean;
  reason?: string;
}

export const validatePlayerCount = (trackedPlayers: PlayerTime[], t: any): ValidationResult & { activeCount: number } => {
  const activePlayers = trackedPlayers.filter(p => p.isPlaying);
  const activeCount = activePlayers.length;
  
  if (activeCount > 7) {
    return {
      isValid: false,
      activeCount,
      message: t('referee.tooManyPlayers', 'Too many players on field: {count}/7').replace('{count}', String(activeCount))
    };
  }
  
  return {
    isValid: true,
    activeCount
  };
};

export const validateTeamLock = (trackedPlayers: PlayerTime[], t: any): TeamLockValidation => {
  const activeTeams = [...new Set(trackedPlayers.filter(p => p.isPlaying).map(p => p.team))];
  
  if (activeTeams.length === 1) {
    return {
      isLocked: true,
      lockedTeam: activeTeams[0]
    };
  }
  
  return {
    isLocked: false
  };
};

export const canRemovePlayer = (playerId: number, trackedPlayers: PlayerTime[], t?: any): RemovalValidation => {
  const player = trackedPlayers.find(p => p.id === playerId);
  
  if (!player) {
    return {
      canRemove: false,
      reason: t?.('referee.playerNotFound', 'Player not found')
    };
  }
  
  // For now, allow removal of any player (can be enhanced later)
  return {
    canRemove: true
  };
};
