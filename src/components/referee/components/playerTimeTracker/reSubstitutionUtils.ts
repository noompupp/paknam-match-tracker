
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

/**
 * Detects when 8 or more players have been tracked, allowing re-substitution
 */
export const canAllowReSubstitution = (trackedPlayers: PlayerTime[]): boolean => {
  return trackedPlayers.length >= 8;
};

/**
 * Gets tracked players who are currently OFF and can be re-substituted
 */
export const getReSubstitutionCandidates = (trackedPlayers: PlayerTime[]): PlayerTime[] => {
  if (!canAllowReSubstitution(trackedPlayers)) {
    return [];
  }
  
  return trackedPlayers.filter(player => !player.isPlaying);
};

/**
 * Converts PlayerTime to ProcessedPlayer format for substitution modal
 */
export const convertPlayerTimeToProcessedPlayer = (
  playerTime: PlayerTime, 
  allPlayers: ProcessedPlayer[]
): ProcessedPlayer | null => {
  const playerInfo = allPlayers.find(p => p.id === playerTime.id);
  
  if (!playerInfo) {
    // Create a basic ProcessedPlayer from PlayerTime if not found in allPlayers
    return {
      id: playerTime.id,
      name: playerTime.name,
      team: playerTime.team,
      team_id: '', // Add missing team_id property
      number: 0, // Default number since PlayerTime doesn't have this property
      position: 'Player', // Add missing position property
      role: 'Starter' // Default role
    };
  }
  
  return playerInfo;
};

/**
 * Enhanced available players logic that includes re-substitution candidates
 */
export interface EnhancedAvailablePlayers {
  newPlayers: ProcessedPlayer[];
  reSubstitutionPlayers: ProcessedPlayer[];
  canReSubstitute: boolean;
}

export const getEnhancedAvailablePlayers = (
  trackedPlayers: PlayerTime[],
  teamPlayers: ProcessedPlayer[]
): EnhancedAvailablePlayers => {
  const canReSubstitute = canAllowReSubstitution(trackedPlayers);
  
  // Get new players (not yet tracked)
  const newPlayers = teamPlayers.filter(player => 
    !trackedPlayers.some(tracked => tracked.id === player.id)
  );
  
  // Get re-substitution candidates
  const reSubstitutionCandidates = getReSubstitutionCandidates(trackedPlayers);
  const reSubstitutionPlayers = reSubstitutionCandidates
    .map(playerTime => convertPlayerTimeToProcessedPlayer(playerTime, teamPlayers))
    .filter((player): player is ProcessedPlayer => player !== null);
  
  return {
    newPlayers,
    reSubstitutionPlayers,
    canReSubstitute
  };
};
