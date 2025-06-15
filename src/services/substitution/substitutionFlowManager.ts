
import { SubstitutionManager } from "./types";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { PlayerTime } from "@/types/database";
import { getSubstitutionScenario } from "./substitutionScenarios";

/**
 * Determines substitution action and next steps.
 * Returns a scenario object and any extra data needed.
 */
export function handleSubstitutionAction({
  player,
  substitutionManager,
  playersForTimeTracker,
}: {
  player: PlayerTime;
  substitutionManager: SubstitutionManager;
  playersForTimeTracker: PlayerTime[];
}) {
  const scenario = getSubstitutionScenario({
    player,
    substitutionManager,
    playersForTimeTracker,
  });
  return scenario;
}
