
import { PlayerTime } from "@/types/database";
import { TimeStatus, PlayerHalfTimes } from "./types";
import { getRoleConstraints } from "./roleConstraints";
import { SEVEN_A_SIDE_CONSTANTS, isSecondHalf } from "@/utils/timeUtils";

export const getTimeStatus = (
  player: PlayerTime & { halfTimes?: PlayerHalfTimes }, 
  role: string, 
  matchTime: number, 
  playerHalfTimes?: Map<number, PlayerHalfTimes>
): TimeStatus => {
  const constraints = getRoleConstraints(role);
  
  // Get half times from player object or from the map
  const halfTimes = player.halfTimes || playerHalfTimes?.get(player.id) || { firstHalf: 0, secondHalf: 0 };
  
  // Determine which half we're checking based on match time
  const currentHalf = isSecondHalf(matchTime) ? 2 : 1;
  const currentHalfTime = currentHalf === 1 ? halfTimes.firstHalf : halfTimes.secondHalf;
  
  console.log('🔍 Time status check (FIXED):', {
    playerName: player.name,
    role,
    currentHalf,
    currentHalfTime: `${Math.floor(currentHalfTime / 60)}:${String(currentHalfTime % 60).padStart(2, '0')}`,
    firstHalfTime: `${Math.floor(halfTimes.firstHalf / 60)}:${String(halfTimes.firstHalf % 60).padStart(2, '0')}`,
    secondHalfTime: `${Math.floor(halfTimes.secondHalf / 60)}:${String(halfTimes.secondHalf % 60).padStart(2, '0')}`,
    totalTime: `${Math.floor(player.totalTime / 60)}:${String(player.totalTime % 60).padStart(2, '0')}`,
    constraints,
    matchTime: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`
  });
  
  // Check S-class per-half limits (20 minutes = 1200 seconds)
  if (role.toLowerCase() === 's-class' && constraints.maxPerHalf) {
    if (currentHalfTime >= constraints.maxPerHalf) {
      console.log('🚨 S-Class limit exceeded:', {
        player: player.name,
        currentHalfTime: Math.floor(currentHalfTime / 60),
        limit: Math.floor(constraints.maxPerHalf / 60)
      });
      return 'exceeded';
    }
    if (constraints.warningPerHalf && currentHalfTime >= constraints.warningPerHalf) {
      console.log('⚠️ S-Class warning threshold reached:', {
        player: player.name,
        currentHalfTime: Math.floor(currentHalfTime / 60),
        warningThreshold: Math.floor(constraints.warningPerHalf / 60)
      });
      return 'critical';
    }
  }
  
  // Check Starter minimum total time (only relevant near end of match)
  if (role.toLowerCase() === 'starter' && constraints.minTotal) {
    const remainingTime = SEVEN_A_SIDE_CONSTANTS.STANDARD_MATCH_DURATION - matchTime;
    if (remainingTime < 300 && player.totalTime < constraints.minTotal) { // 5 minutes remaining
      console.log('⚠️ Starter minimum time warning:', {
        player: player.name,
        totalTime: Math.floor(player.totalTime / 60),
        minRequired: Math.floor(constraints.minTotal / 60),
        remainingMatchTime: Math.floor(remainingTime / 60)
      });
      return 'insufficient';
    }
  }
  
  return 'normal';
};
