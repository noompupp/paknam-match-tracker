
import { useRefereeContainerState } from "./useRefereeContainerState";
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
  // Use the container state which orchestrates all the smaller hooks
  const containerState = useRefereeContainerState();

  console.log('🎯 useRefereeState Summary (Refactored - Using Container State):', {
    selectedFixture: containerState.selectedFixture,
    hasSelectedFixtureData: !!containerState.selectedFixtureData,
    homePlayersCount: containerState.homeTeamPlayers.length,
    awayPlayersCount: containerState.awayTeamPlayers.length,
    totalPlayersCount: containerState.allPlayers.length,
    enhancedDataValid: containerState.enhancedPlayersData.hasValidData,
    dataIssues: containerState.enhancedPlayersData.dataIssues,
    selectedGoalTeam: containerState.selectedGoalTeam,
    selectedTimeTeam: containerState.selectedTimeTeam,
    goalFilteredPlayersCount: containerState.getGoalFilteredPlayers().length,
    timeFilteredPlayersCount: containerState.getTimeFilteredPlayers().length,
    databaseDrivenScore: { homeScore: containerState.homeScore, awayScore: containerState.awayScore },
    hasRealTimeSync: !!containerState.forceRefresh
  });

  // Return the complete state from the container
  return containerState;
};

export type { ComponentPlayer, PlayerTimeTrackerPlayer };
