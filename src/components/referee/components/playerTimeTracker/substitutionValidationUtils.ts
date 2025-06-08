
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

export interface SubstitutionValidation {
  canSubIn: boolean;
  canSubOut: boolean;
  requiresSubstitution: boolean;
  reason?: string;
  actionType?: 'substitute' | 'direct';
  isReSubstitution?: boolean;
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
  
  console.log('🔍 validateSubstitution:', {
    actionType,
    playerId,
    playerName: player?.name || newPlayer?.name,
    isPlaying: player?.isPlaying,
    activeCount: activePlayers.length,
    trackedCount: trackedPlayers.length
  });

  if (actionType === 'in' && newPlayer) {
    const validation = canSubPlayerIn(newPlayer, trackedPlayers);
    return {
      canSubIn: validation.canAdd,
      canSubOut: true,
      requiresSubstitution: activePlayers.length >= FIELD_PLAYER_LIMIT,
      reason: validation.reason,
      actionType: activePlayers.length >= FIELD_PLAYER_LIMIT ? 'substitute' : 'direct',
      isReSubstitution: false
    };
  }
  
  if (actionType === 'out' && player) {
    const validation = canSubPlayerOut(playerId, trackedPlayers);
    return {
      canSubIn: true,
      canSubOut: validation.canRemove,
      requiresSubstitution: activePlayers.length <= FIELD_PLAYER_LIMIT && player.isPlaying,
      reason: validation.reason,
      actionType: 'direct',
      isReSubstitution: false
    };
  }
  
  if (actionType === 'toggle' && player) {
    const isReSubstitution = !player.isPlaying; // Player is currently off field
    
    if (player.isPlaying) {
      // Toggling from playing to not playing (subbing out)
      const validation = canSubPlayerOut(playerId, trackedPlayers);
      return {
        canSubIn: true,
        canSubOut: validation.canRemove,
        requiresSubstitution: activePlayers.length <= FIELD_PLAYER_LIMIT,
        reason: validation.reason,
        actionType: activePlayers.length <= FIELD_PLAYER_LIMIT ? 'substitute' : 'direct',
        isReSubstitution: false
      };
    } else {
      // Toggling from not playing to playing (re-substitution)
      if (activePlayers.length >= FIELD_PLAYER_LIMIT) {
        console.log('🚨 Re-substitution blocked - field is full:', {
          playerName: player.name,
          activeCount: activePlayers.length,
          limit: FIELD_PLAYER_LIMIT
        });
        
        return {
          canSubIn: false,
          canSubOut: true,
          requiresSubstitution: true,
          reason: 'Field is full - must substitute another player out first',
          actionType: 'substitute',
          isReSubstitution: true
        };
      }
      
      // Field has space, allow direct re-entry
      return {
        canSubIn: true,
        canSubOut: true,
        requiresSubstitution: false,
        actionType: 'direct',
        isReSubstitution: true
      };
    }
  }
  
  return {
    canSubIn: false,
    canSubOut: false,
    requiresSubstitution: false,
    reason: 'Invalid action type',
    isReSubstitution: false
  };
};

export const getSubstitutionMessage = (validation: SubstitutionValidation): string => {
  if (validation.requiresSubstitution && validation.actionType === 'substitute') {
    return validation.isReSubstitution 
      ? 'Re-substitution requires removing another player first'
      : 'Substitution required - field limit reached';
  }
  if (!validation.canSubIn && !validation.canSubOut) {
    return validation.reason || 'Action not allowed';
  }
  return 'Action allowed';
};
