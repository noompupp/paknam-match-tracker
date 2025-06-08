
import { useRefereeStateOrchestrator } from "./useRefereeStateOrchestrator";
import type { ProcessedPlayer } from "@/utils/refereeDataProcessor";

// Use the ProcessedPlayer from refereeDataProcessor for consistency
interface ComponentPlayer extends ProcessedPlayer {}

interface PlayerTimeTrackerPlayer {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
  totalTime: number;
  startTime: number | null;
  isPlaying: boolean;
}

export const useRefereeState = () => {
  // Use the new orchestrator which handles all state coordination
  const orchestratorState = useRefereeStateOrchestrator();

  console.log('🎯 useRefereeState Summary (Refactored - Using Orchestrator State):', {
    selectedFixture: orchestratorState.selectedFixture,
    hasSelectedFixtureData: !!orchestratorState.selectedFixtureData,
    homePlayersCount: orchestratorState.homeTeamPlayers.length,
    awayPlayersCount: orchestratorState.awayTeamPlayers.length,
    totalPlayersCount: orchestratorState.allPlayers.length,
    enhancedDataValid: orchestratorState.enhancedPlayersData.hasValidData,
    dataIssues: orchestratorState.enhancedPlayersData.dataIssues,
    selectedGoalTeam: orchestratorState.selectedGoalTeam,
    selectedTimeTeam: orchestratorState.selectedTimeTeam,
    goalFilteredPlayersCount: orchestratorState.getGoalFilteredPlayers().length,
    timeFilteredPlayersCount: orchestratorState.getTimeFilteredPlayers().length,
    databaseDrivenScore: { homeScore: orchestratorState.homeScore, awayScore: orchestratorState.awayScore },
    hasRealTimeSync: !!orchestratorState.forceRefresh
  });

  // Return the complete state from the orchestrator
  return orchestratorState;
};

export type { ComponentPlayer, PlayerTimeTrackerPlayer };
