
import { PlayerTime } from "@/types/database";
import { TimeStatus, PlayerHalfTimes } from "./types";
import { getRoleConstraints } from "./roleConstraints";
import { SEVEN_A_SIDE_CONSTANTS, isSecondHalf } from "@/utils/timeUtils";

export const getTimeStatus = (
  player: PlayerTime, 
  role: string, 
  matchTime: number, 
  playerHalfTimes: Map<number, PlayerHalfTimes>
): TimeStatus => {
  const constraints = getRoleConstraints(role);
  const halfTimes = playerHalfTimes.get(player.id) || { firstHalf: 0, secondHalf: 0 };
  
  // Calculate current half time for this player
  const currentHalfTime = isSecondHalf(matchTime) ? halfTimes.secondHalf : halfTimes.firstHalf;
  
  console.log('🔍 Time status check:', {
    playerName: player.name,
    role,
    currentHalfTime,
    totalTime: player.totalTime,
    constraints
  });
  
  // Check S-class per-half limits
  if (role.toLowerCase() === 's-class' && constraints.maxPerHalf) {
    if (currentHalfTime >= constraints.maxPerHalf) {
      console.log('🚨 S-Class limit exceeded:', player.name);
      return 'exceeded';
    }
    if (constraints.warningPerHalf && currentHalfTime >= constraints.warningPerHalf) {
      console.log('⚠️ S-Class warning threshold reached:', player.name);
      return 'critical';
    }
  }
  
  // Check Starter minimum total time (only relevant near end of match)
  if (role.toLowerCase() === 'starter' && constraints.minTotal) {
    const remainingTime = SEVEN_A_SIDE_CONSTANTS.STANDARD_MATCH_DURATION - matchTime;
    if (remainingTime < 300 && player.totalTime < constraints.minTotal) { // 5 minutes remaining
      console.log('⚠️ Starter minimum time warning:', player.name);
      return 'insufficient';
    }
  }
  
  return 'normal';
};
