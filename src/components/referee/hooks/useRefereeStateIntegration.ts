
import { useRefereeBaseState } from "./useRefereeBaseState";
import { useRefereeScoreState } from "./useRefereeScoreState";
import { useRefereePlayerData } from "./useRefereePlayerData";
import { useRefereeTeamSelection } from "./useRefereeTeamSelection";
import { useRefereeMatchState } from "./useRefereeMatchState";

export const useRefereeStateIntegration = () => {
  // Base state (fixtures, timer, etc.)
  const baseState = useRefereeBaseState();

  // Score state with real-time sync
  const scoreState = useRefereeScoreState({
    selectedFixtureData: baseState.selectedFixtureData
  });

  // Match state (goals, cards, events, player tracking)
  const matchState = useRefereeMatchState({
    selectedFixtureData: baseState.selectedFixtureData,
    isRunning: baseState.isRunning,
    matchTime: baseState.matchTime
  });

  // Player data with enhanced processing - use matchState.trackedPlayers instead of playerData.playersForTimeTracker
  const playerData = useRefereePlayerData({
    selectedFixture: baseState.selectedFixture,
    selectedFixtureData: baseState.selectedFixtureData,
    fixtures: baseState.fixtures,
    members: baseState.members,
    trackedPlayers: matchState.trackedPlayers // Fix: use matchState.trackedPlayers instead of playerData.playersForTimeTracker
  });

  // Team selection management
  const teamSelection = useRefereeTeamSelection({
    selectedFixture: baseState.selectedFixture,
    homeTeamPlayers: playerData.homeTeamPlayers,
    awayTeamPlayers: playerData.awayTeamPlayers
  });

  // Check for players needing attention - fix the method call to use single argument
  const playersNeedingAttention = matchState.getPlayersNeedingAttentionForMatch
    ? matchState.getPlayersNeedingAttentionForMatch(playerData.playersForTimeTracker)
    : [];

  return {
    baseState,
    scoreState,
    matchState,
    playerData,
    teamSelection,
    playersNeedingAttention
  };
};
