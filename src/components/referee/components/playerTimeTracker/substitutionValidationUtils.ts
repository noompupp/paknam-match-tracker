
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

export interface SubstitutionValidation {
  canSubIn: boolean;
  canSubOut: boolean;
  requiresSubstitution: boolean;
  reason?: string;
  actionType?: 'substitute' | 'direct';
}

export const FIELD_PLAYER_LIMIT = 7;

export const canSubPlayerIn = (
  newPlayer: ProcessedPlayer,
  trackedPlayers: PlayerTime[]
): { canAdd: boolean; reason?: string } => {
  const activePlayers = trackedPlayers.filter(p => p.isPlaying);
  
  // Check if player is already tracked
  const isAlreadyTracked = trackedPlayers.some(p => p.id === newPlayer.id);
  if (isAlreadyTracked) {
    return { canAdd: false, reason: 'Player is already in the squad' };
  }
  
  // Check team consistency
  if (trackedPlayers.length > 0) {
    const firstPlayerTeam = trackedPlayers[0].team;
    if (newPlayer.team !== firstPlayerTeam) {
      return { canAdd: false, reason: `Can only add players from ${firstPlayerTeam}` };
    }
  }
  
  // If field is full, substitution is required
  if (activePlayers.length >= FIELD_PLAYER_LIMIT) {
    return { canAdd: false, reason: 'Field is full - substitution required' };
  }
  
  return { canAdd: true };
};

export const canSubPlayerOut = (
  playerId: number,
  trackedPlayers: PlayerTime[]
): { canRemove: boolean; reason?: string } => {
  const player = trackedPlayers.find(p => p.id === playerId);
  if (!player) {
    return { canRemove: false, reason: 'Player not found' };
  }
  
  // Can always sub out if player is not currently playing
  if (!player.isPlaying) {
    return { canRemove: true };
  }
  
  const activePlayers = trackedPlayers.filter(p => p.isPlaying);
  
  // Allow subbing out if it won't go below minimum
  if (activePlayers.length > 1) {
    return { canRemove: true };
  }
  
  return { 
    canRemove: false, 
    reason: 'Cannot remove last player on field' 
  };
};

export const requiresSubstitution = (trackedPlayers: PlayerTime[]): boolean => {
  const activePlayers = trackedPlayers.filter(p => p.isPlaying);
  return activePlayers.length < FIELD_PLAYER_LIMIT;
};

export const validateSubstitution = (
  actionType: 'in' | 'out' | 'toggle',
  playerId: number,
  trackedPlayers: PlayerTime[],
  newPlayer?: ProcessedPlayer
): SubstitutionValidation => {
  const player = trackedPlayers.find(p => p.id === playerId);
  const activePlayers = trackedPlayers.filter(p => p.isPlaying);
  
  if (actionType === 'in' && newPlayer) {
    const validation = canSubPlayerIn(newPlayer, trackedPlayers);
    return {
      canSubIn: validation.canAdd,
      canSubOut: true,
      requiresSubstitution: activePlayers.length >= FIELD_PLAYER_LIMIT,
      reason: validation.reason,
      actionType: activePlayers.length >= FIELD_PLAYER_LIMIT ? 'substitute' : 'direct'
    };
  }
  
  if (actionType === 'out' && player) {
    const validation = canSubPlayerOut(playerId, trackedPlayers);
    return {
      canSubIn: true,
      canSubOut: validation.canRemove,
      requiresSubstitution: activePlayers.length <= FIELD_PLAYER_LIMIT && player.isPlaying,
      reason: validation.reason,
      actionType: 'direct'
    };
  }
  
  if (actionType === 'toggle' && player) {
    if (player.isPlaying) {
      // Toggling from playing to not playing
      const validation = canSubPlayerOut(playerId, trackedPlayers);
      return {
        canSubIn: true,
        canSubOut: validation.canRemove,
        requiresSubstitution: activePlayers.length <= FIELD_PLAYER_LIMIT,
        reason: validation.reason,
        actionType: activePlayers.length <= FIELD_PLAYER_LIMIT ? 'substitute' : 'direct'
      };
    } else {
      // Toggling from not playing to playing
      if (activePlayers.length >= FIELD_PLAYER_LIMIT) {
        return {
          canSubIn: false,
          canSubOut: true,
          requiresSubstitution: true,
          reason: 'Field is full - substitution required',
          actionType: 'substitute'
        };
      }
      return {
        canSubIn: true,
        canSubOut: true,
        requiresSubstitution: false,
        actionType: 'direct'
      };
    }
  }
  
  return {
    canSubIn: false,
    canSubOut: false,
    requiresSubstitution: false,
    reason: 'Invalid action type'
  };
};

export const getSubstitutionMessage = (validation: SubstitutionValidation): string => {
  if (validation.requiresSubstitution && validation.actionType === 'substitute') {
    return 'Substitution required - field limit reached';
  }
  if (!validation.canSubIn && !validation.canSubOut) {
    return validation.reason || 'Action not allowed';
  }
  return 'Action allowed';
};
