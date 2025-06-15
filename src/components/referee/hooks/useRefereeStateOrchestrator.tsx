
import { useRefereeStateIntegration } from "./useRefereeStateIntegration";
import { useRefereeEnhancedHandlers } from "./useRefereeEnhancedHandlers";
import { useMatchStore } from "@/stores/useMatchStore";
import { useEffect, useRef } from "react";

export const useRefereeStateOrchestrator = () => {
  // Get all integrated state
  const orchestrator = useRefereeStateIntegration();
  // Use match store directly for homeScore/awayScore/team names
  const { homeScore, awayScore, homeTeamName: storeHomeTeamName, awayTeamName: storeAwayTeamName } = useMatchStore();

  // Track last fixture id in a ref to avoid duplicate calls
  const lastFixtureIdRef = useRef<number | null>(null);

  useEffect(() => {
    const selectedFixtureData = orchestrator.baseState.selectedFixtureData;
    if (!selectedFixtureData) return;

    // Always prefer most recent team info (store > fixtureData)
    const newFixtureId = selectedFixtureData.id;
    const homeTeamNameValue =
      storeHomeTeamName && storeHomeTeamName.length > 0
        ? storeHomeTeamName
        : selectedFixtureData.home_team?.name || selectedFixtureData.home_team_name || "";
    const awayTeamNameValue =
      storeAwayTeamName && storeAwayTeamName.length > 0
        ? storeAwayTeamName
        : selectedFixtureData.away_team?.name || selectedFixtureData.away_team_name || "";
    const homeTeamId = String(
      selectedFixtureData.home_team?.id ||
      selectedFixtureData.home_team?.__id__ ||
      selectedFixtureData.home_team_id ||
      ""
    );
    const awayTeamId = String(
      selectedFixtureData.away_team?.id ||
      selectedFixtureData.away_team?.__id__ ||
      selectedFixtureData.away_team_id ||
      ""
    );

    // If missing teams, skip setupMatch
    if (!homeTeamNameValue || !awayTeamNameValue) {
      console.warn("[useRefereeStateOrchestrator] setupMatch skipped: missing team names", {
        fixtureId: newFixtureId,
        homeTeamNameValue,
        awayTeamNameValue
      });
      return;
    }

    // Only update if changed
    if (
      newFixtureId !== lastFixtureIdRef.current ||
      storeHomeTeamName !== homeTeamNameValue ||
      storeAwayTeamName !== awayTeamNameValue
    ) {
      orchestrator.matchState?.setupMatch?.({
        fixtureId: newFixtureId,
        homeTeamName: homeTeamNameValue,
        awayTeamName: awayTeamNameValue,
        homeTeamId,
        awayTeamId,
      });
      lastFixtureIdRef.current = newFixtureId;
      setTimeout(() => {
        const storeState = useMatchStore.getState();
        console.log('[useRefereeStateOrchestrator] 🟢 Store snapshot immediately after setupMatch:', {
          fixtureId: selectedFixtureData.id,
          homeTeamName: storeState.homeTeamName,
          awayTeamName: storeState.awayTeamName,
          homeScore: storeState.homeScore,
          awayScore: storeState.awayScore,
          goals: storeState.goals,
        });
      }, 0);
      console.log(
        "[useRefereeStateOrchestrator] setupMatch called on fixture/team data change:",
        {
          fixtureId: newFixtureId,
          homeTeamName: homeTeamNameValue,
          awayTeamName: awayTeamNameValue,
          homeTeamId,
          awayTeamId
        }
      );
    }
  // Must trigger if fixture data, home/away name (either in store or fixture), or setupMatch reference changes
  }, [
    orchestrator.baseState.selectedFixtureData,
    orchestrator.matchState?.setupMatch,
    storeHomeTeamName,
    storeAwayTeamName
  ]);

  // Get enhanced handlers
  const enhancedHandlers = useRefereeEnhancedHandlers({
    baseState: orchestrator.baseState,
    scoreState: orchestrator.scoreState,
    matchState: orchestrator.matchState,
    playerData: orchestrator.playerData
  });

  console.log('🎯 useRefereeStateOrchestrator Summary (Database-Driven Scores):', {
    selectedFixture: orchestrator.baseState.selectedFixture,
    hasSelectedFixtureData: !!orchestrator.baseState.selectedFixtureData,
    totalMembers: orchestrator.baseState.members?.length || 0,
    homePlayersCount: orchestrator.playerData.homeTeamPlayers.length,
    awayPlayersCount: orchestrator.playerData.awayTeamPlayers.length,
    totalPlayersCount: orchestrator.playerData.allPlayers.length,
    enhancedDataValid: orchestrator.playerData.enhancedPlayersData.hasValidData,
    dataIssues: orchestrator.playerData.enhancedPlayersData.dataIssues,
    selectedGoalTeam: orchestrator.teamSelection.selectedGoalTeam,
    selectedTimeTeam: orchestrator.teamSelection.selectedTimeTeam,
    goalFilteredPlayersCount: orchestrator.teamSelection.getGoalFilteredPlayers().length,
    timeFilteredPlayersCount: orchestrator.teamSelection.getTimeFilteredPlayers().length,
    databaseDrivenScore: { homeScore: orchestrator.scoreState.homeScore, awayScore: orchestrator.scoreState.awayScore },
    hasRealTimeSync: !!orchestrator.scoreState.forceRefresh
  });

  return {
    // Base state
    fixtures: orchestrator.baseState.fixtures,
    fixturesLoading: orchestrator.baseState.fixturesLoading,
    selectedFixture: orchestrator.baseState.selectedFixture,
    setSelectedFixture: orchestrator.baseState.setSelectedFixture,
    selectedFixtureData: orchestrator.baseState.selectedFixtureData,
    enhancedPlayersData: orchestrator.playerData.enhancedPlayersData,
    
    // Player data
    allPlayers: orchestrator.playerData.allPlayers,
    homeTeamPlayers: orchestrator.playerData.homeTeamPlayers,
    awayTeamPlayers: orchestrator.playerData.awayTeamPlayers,
    playersForTimeTracker: orchestrator.playerData.playersForTimeTracker,
    playersNeedingAttention: orchestrator.playersNeedingAttention,
    
    // Team selections
    selectedGoalTeam: orchestrator.teamSelection.selectedGoalTeam,
    setSelectedGoalTeam: orchestrator.teamSelection.setSelectedGoalTeam,
    selectedTimeTeam: orchestrator.teamSelection.selectedTimeTeam,
    setSelectedTimeTeam: orchestrator.teamSelection.setSelectedTimeTeam,
    getGoalFilteredPlayers: orchestrator.teamSelection.getGoalFilteredPlayers,
    getTimeFilteredPlayers: orchestrator.teamSelection.getTimeFilteredPlayers,
    
    // Timer
    matchTime: orchestrator.baseState.matchTime,
    isRunning: orchestrator.baseState.isRunning,
    formatTime: orchestrator.baseState.formatTime,
    
    // Database-driven score with real-time sync
    homeScore,
    awayScore,
    
    // Goals
    goals: orchestrator.matchState.goals,
    selectedGoalPlayer: orchestrator.matchState.selectedGoalPlayer,
    selectedGoalType: orchestrator.matchState.selectedGoalType,
    setSelectedGoalPlayer: orchestrator.matchState.setSelectedGoalPlayer,
    setSelectedGoalType: orchestrator.matchState.setSelectedGoalType,
    
    // Cards
    cards: orchestrator.matchState.cards,
    selectedPlayer: orchestrator.matchState.selectedPlayer,
    selectedTeam: orchestrator.matchState.selectedTeam,
    selectedCardType: orchestrator.matchState.selectedCardType,
    setSelectedPlayer: orchestrator.matchState.setSelectedPlayer,
    setSelectedTeam: orchestrator.matchState.setSelectedTeam,
    setSelectedCardType: orchestrator.matchState.setSelectedCardType,
    
    // Time tracking
    trackedPlayers: orchestrator.matchState.trackedPlayers,
    selectedTimePlayer: orchestrator.matchState.selectedTimePlayer,
    setSelectedTimePlayer: orchestrator.matchState.setSelectedTimePlayer,
    
    // Events
    events: orchestrator.matchState.events,

    // The missing reset functions and event logger passed through from correct sources:
    resetScore: orchestrator.scoreState.resetScore,           // <<--- Fix: now from scoreState
    resetEvents: orchestrator.matchState.resetEvents,
    resetCards: orchestrator.matchState.resetCards,
    resetTracking: orchestrator.matchState.resetTracking,
    resetGoals: orchestrator.matchState.resetGoals,
    addEvent: orchestrator.matchState.addEvent,
    
    // Save attempts
    saveAttempts: orchestrator.baseState.saveAttempts,
    
    // Enhanced handlers with database-driven scores and real-time sync
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
    forceRefresh: orchestrator.scoreState.forceRefresh, // Expose immediate refresh for components
    resetState: enhancedHandlers.resetState, // Expose reset state for components
    handleManualRefresh: orchestrator.handleManualRefresh // <-- Fixed: get from orchestrator
  };
};
