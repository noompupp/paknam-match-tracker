
import { useRefereeStateIntegration } from "./useRefereeStateIntegration";
import { useRefereeEnhancedHandlers } from "./useRefereeEnhancedHandlers";
import { useMatchStore } from "@/stores/useMatchStore";
import { useEffect, useRef } from "react";

export const useRefereeStateOrchestrator = () => {
  const orchestrator = useRefereeStateIntegration();

  const {
    homeScore,
    awayScore,
    homeTeamName: storeHomeTeamName,
    awayTeamName: storeAwayTeamName,
    homeTeamId: storeHomeTeamId,
    awayTeamId: storeAwayTeamId,
    lastUpdated,
    setupMatch
  } = useMatchStore();

  const lastSetupParams = useRef<{
    fixtureId: number | null,
    homeTeamName: string,
    awayTeamName: string
  } | null>(null);

  function resolveTeamName(possible: string | undefined, fallback: string | undefined): string {
    if (typeof possible === "string" && possible.trim().length > 0) return possible.trim();
    if (typeof fallback === "string" && fallback.trim().length > 0) return fallback.trim();
    return "";
  }

  useEffect(() => {
    const { selectedFixtureData } = orchestrator.baseState;
    if (!selectedFixtureData) return;

    const fixtureId = selectedFixtureData.id;
    const fixtureHome = selectedFixtureData.home_team?.name || "";
    const fixtureAway = selectedFixtureData.away_team?.name || "";

    const homeTeamName = resolveTeamName(storeHomeTeamName, fixtureHome);
    const awayTeamName = resolveTeamName(storeAwayTeamName, fixtureAway);

    const homeTeamId = String(
      selectedFixtureData.home_team?.id ||
      selectedFixtureData.home_team?.__id__ ||
      selectedFixtureData.home_team_id ||
      storeHomeTeamId ||
      ""
    );
    const awayTeamId = String(
      selectedFixtureData.away_team?.id ||
      selectedFixtureData.away_team?.__id__ ||
      selectedFixtureData.away_team_id ||
      storeAwayTeamId ||
      ""
    );

    const setupChanged =
      !lastSetupParams.current ||
      lastSetupParams.current.fixtureId !== fixtureId ||
      lastSetupParams.current.homeTeamName !== homeTeamName ||
      lastSetupParams.current.awayTeamName !== awayTeamName;

    if (
      homeTeamName &&
      awayTeamName &&
      fixtureId &&
      setupChanged
    ) {
      setupMatch({
        fixtureId,
        homeTeamName,
        awayTeamName,
        homeTeamId,
        awayTeamId
      });
      lastSetupParams.current = {
        fixtureId,
        homeTeamName,
        awayTeamName,
      };
    }
  }, [
    orchestrator.baseState.selectedFixtureData,
    setupMatch,
    storeHomeTeamName,
    storeAwayTeamName,
    storeHomeTeamId,
    storeAwayTeamId
  ]);

  useEffect(() => {
    // no-op, reserved for permission debug
  }, []);

  const enhancedHandlers = useRefereeEnhancedHandlers({
    baseState: orchestrator.baseState,
    scoreState: orchestrator.scoreState,
    matchState: orchestrator.matchState,
    playerData: orchestrator.playerData
  });

  return {
    fixtures: orchestrator.baseState.fixtures,
    fixturesLoading: orchestrator.baseState.fixturesLoading,
    selectedFixture: orchestrator.baseState.selectedFixture,
    setSelectedFixture: orchestrator.baseState.setSelectedFixture,
    selectedFixtureData: orchestrator.baseState.selectedFixtureData,
    enhancedPlayersData: orchestrator.playerData.enhancedPlayersData,
    allPlayers: orchestrator.playerData.allPlayers,
    homeTeamPlayers: orchestrator.playerData.homeTeamPlayers,
    awayTeamPlayers: orchestrator.playerData.awayTeamPlayers,
    playersForTimeTracker: orchestrator.playerData.playersForTimeTracker,
    playersNeedingAttention: orchestrator.playersNeedingAttention,
    selectedGoalTeam: orchestrator.teamSelection.selectedGoalTeam,
    setSelectedGoalTeam: orchestrator.teamSelection.setSelectedGoalTeam,
    selectedTimeTeam: orchestrator.teamSelection.selectedTimeTeam,
    setSelectedTimeTeam: orchestrator.teamSelection.setSelectedTimeTeam,
    getGoalFilteredPlayers: orchestrator.teamSelection.getGoalFilteredPlayers,
    getTimeFilteredPlayers: orchestrator.teamSelection.getTimeFilteredPlayers,
    matchTime: orchestrator.baseState.matchTime,
    isRunning: orchestrator.baseState.isRunning,
    formatTime: orchestrator.baseState.formatTime,
    homeScore,
    awayScore,
    goals: orchestrator.matchState.goals,
    selectedGoalPlayer: orchestrator.matchState.selectedGoalPlayer,
    selectedGoalType: orchestrator.matchState.selectedGoalType,
    setSelectedGoalPlayer: orchestrator.matchState.setSelectedGoalPlayer,
    setSelectedGoalType: orchestrator.matchState.setSelectedGoalType,
    cards: orchestrator.matchState.cards,
    selectedPlayer: orchestrator.matchState.selectedPlayer,
    selectedTeam: orchestrator.matchState.selectedTeam,
    selectedCardType: orchestrator.matchState.selectedCardType,
    setSelectedPlayer: orchestrator.matchState.setSelectedPlayer,
    setSelectedTeam: orchestrator.matchState.setSelectedTeam,
    setSelectedCardType: orchestrator.matchState.setSelectedCardType,
    trackedPlayers: orchestrator.matchState.trackedPlayers,
    selectedTimePlayer: orchestrator.matchState.selectedTimePlayer,
    setSelectedTimePlayer: orchestrator.matchState.setSelectedTimePlayer,
    events: orchestrator.matchState.events,
    resetScore: orchestrator.scoreState.resetScore,
    resetEvents: orchestrator.matchState.resetEvents,
    resetCards: orchestrator.matchState.resetCards,
    resetTracking: orchestrator.matchState.resetTracking,
    resetGoals: orchestrator.matchState.resetGoals,
    addEvent: orchestrator.matchState.addEvent,
    saveAttempts: orchestrator.baseState.saveAttempts,
    handleSaveMatch: enhancedHandlers.handleSaveMatch,
    handleResetMatch: enhancedHandlers.handleResetMatch,
    handleAssignGoal: enhancedHandlers.handleAssignGoal,
    handleAddCard: enhancedHandlers.handleAddCard,
    handleAddPlayer: enhancedHandlers.handleAddPlayer,
    handleRemovePlayer: enhancedHandlers.handleRemovePlayer,
    handleTogglePlayerTime: enhancedHandlers.handleTogglePlayerTime,
    toggleTimer: orchestrator.baseState.toggleTimer,
    resetTimer: orchestrator.baseState.resetTimer,
    assignGoal: orchestrator.matchState.assignGoal,
    removePlayer: orchestrator.matchState.removePlayer,
    addPlayer: orchestrator.matchState.addPlayer,
    forceRefresh: orchestrator.scoreState.forceRefresh,
    resetState: enhancedHandlers.resetState,
    handleManualRefresh: orchestrator.handleManualRefresh
  };
};
