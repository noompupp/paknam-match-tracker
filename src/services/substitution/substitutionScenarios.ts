
import { SubstitutionManager } from "./types";
import { ComponentPlayer } from "@/components/referee/hooks/useRefereeState";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

/**
 * Substitution scenario logic:
 * Scenarios:
 * 1. Sub In first (not on field, has played before)
 * 2. Sub Out to complete "Sub In" pending
 * 3. Sub Out first (on field, has played before, no pending)
 * 4. Standard toggle (new/regular players)
 */
export const getSubstitutionScenario = ({
  player,
  substitutionManager,
  playersForTimeTracker,
}: {
  player: PlayerTime;
  substitutionManager: SubstitutionManager;
  playersForTimeTracker: PlayerTime[];
}) => {
  const hasPlayedBefore = player.totalTime > 0;

  // 1: Sub In first (not playing, played before)
  if (!player.isPlaying && hasPlayedBefore) {
    return "PENDING_SUB_IN";
  }

  // 2: Sub Out when someone ready to sub in
  if (
    player.isPlaying &&
    substitutionManager.hasPendingSubstitution &&
    !substitutionManager.isSubOutInitiated
  ) {
    return "COMPLETE_SUBSTITUTION";
  }

  // 3: Sub Out first
  if (player.isPlaying && hasPlayedBefore && !substitutionManager.hasPendingSubstitution) {
    return "INITIATE_SUB_OUT";
  }

  // 4: Standard toggle
  return "STANDARD_TOGGLE";
};
