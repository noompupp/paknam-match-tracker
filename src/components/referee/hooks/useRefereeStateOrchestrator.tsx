
import { useRefereeStateIntegration } from "./useRefereeStateIntegration";
import { useRefereeEnhancedHandlers } from "./useRefereeEnhancedHandlers";
import { useMatchStore } from "@/stores/useMatchStore";
import { useEffect, useRef, React } from "react";

// If in the future we want to leverage permissions for anything UI-conditional, we can fetch here,
// but UnifiedMatchTimer (and all critical scoreboard logic) must NEVER be gated by this state!
export const useRefereeStateOrchestrator = () => {
  // Integrated orchestrator as before
  const orchestrator = useRefereeStateIntegration();

  // Always get live store state for score and team names
  const {
    homeScore,
    awayScore,
    homeTeamName: storeHomeTeamName,
    awayTeamName: storeAwayTeamName,
    lastUpdated
  } = useMatchStore();

  // Keep a ref for last setup params to avoid excessive setupMatch runs
  const lastSetupParams = React.useRef<{
    fixtureId: number | null,
    homeTeamName: string,
    awayTeamName: string
  } | null>(null);

  // Helper to resolve the correct team names using fixture if store values are missing/empty
  function resolveTeamName(possible: string | undefined, fallback: string | undefined): string {
    if (typeof possible === "string" && possible.trim().length > 0) return possible.trim();
    if (typeof fallback === "string" && fallback.trim().length > 0) return fallback.trim();
    return "";
  }

  // UNCONDITIONAL: SetupMatch must always run when fixture/team changes, regardless of permissions/role state.
  useEffect(() => {
    const { selectedFixtureData } = orchestrator.baseState;
    if (!selectedFixtureData) return;

    // Pull team names from fixture data
    const fixtureId = selectedFixtureData.id;
    const fixtureHome = selectedFixtureData.home_team?.name || selectedFixtureData.home_team_name || '';
    const fixtureAway = selectedFixtureData.away_team?.name || selectedFixtureData.away_team_name || '';
    // Use correct logic: prefer store names ONLY if valid, otherwise fallback to fixture team names
    const homeTeamName = resolveTeamName(storeHomeTeamName, fixtureHome);
    const awayTeamName = resolveTeamName(storeAwayTeamName, fixtureAway);

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

    // Defensive: Only fire if changed
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
      orchestrator.matchState?.setupMatch?.({
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

      setTimeout(() => {
        const storeState = useMatchStore.getState();
        // Extra dev-mode warning for empty team names after setup
        if (!storeState.homeTeamName || !storeState.awayTeamName) {
          console.error("[Orchestrator WARNING] setupMatch left home/away team names EMPTY!", {
            fixtureId,
            providedHome: homeTeamName, providedAway: awayTeamName,
            storeHome: storeState.homeTeamName, storeAway: storeState.awayTeamName,
            fixtureHome, fixtureAway
          });
        } else {
          console.log('[Orchestrator] Store after setupMatch:', {
            fixtureId,
            homeTeamName: storeState.homeTeamName,
            awayTeamName: storeState.awayTeamName,
            homeScore: storeState.homeScore,
            awayScore: storeState.awayScore,
            goals: storeState.goals,
          });
        }
      }, 0);

      console.log("[Orchestrator] setupMatch called due to fixture/team change", {
        fixtureId,
        homeTeamName,
        awayTeamName,
        homeTeamId,
        awayTeamId,
      });
    }
  }, [
    orchestrator.baseState.selectedFixtureData,
    orchestrator.matchState?.setupMatch,
    storeHomeTeamName,
    storeAwayTeamName
  ]);

  // Debug loading/permission status (do NOT gate state propagation on this)
  useEffect(() => {
    // If role system changes, log here for debugging, but never block rendering.
    // Future hooks could pull from a permission system, but it's not used here.
    // console.log('Role/permission state is not blocking UnifiedMatchTimer rendering!');
  }, []);

  // Always get enhanced handlers
  const enhancedHandlers = useRefereeEnhancedHandlers({
    baseState: orchestrator.baseState,
    scoreState: orchestrator.scoreState,
    matchState: orchestrator.matchState,
    playerData: orchestrator.playerData
  });

  // DEBUG: print store status each orchestrator render
  useEffect(() => {
    if (!storeHomeTeamName || !storeAwayTeamName) {
      console.warn("[Orchestrator] Team names missing in store! Scoring will not work unless setupMatch is triggered properly.", {
        storeHomeTeamName, storeAwayTeamName
      });
    }
  }, [storeHomeTeamName, storeAwayTeamName, lastUpdated]);

  console.log('🎯 useRefereeStateOrchestrator Summary (Database-Driven Scores) - FIXED WITH HALF TIMES:', {
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
    hasRealTimeSync: !!orchestrator.scoreState.forceRefresh,
    storeHomeTeamName, storeAwayTeamName, lastUpdated,
    // ADDED: Half times tracking
    playerHalfTimesSize: orchestrator.matchState.playerHalfTimes?.size || 0,
    halfTimesDebug: orchestrator.matchState.playerHalfTimes ? 
      Array.from(orchestrator.matchState.playerHalfTimes.entries()).slice(0, 3).map(([id, times]) => ({
        playerId: id,
        firstHalf: `${Math.floor(times.firstHalf / 60)}:${String(times.firstHalf % 60).padStart(2, '0')}`,
        secondHalf: `${Math.floor(times.secondHalf / 60)}:${String(times.secondHalf % 60).padStart(2, '0')}`
      })) : []
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
    
    // Store-synced scores (NEVER block on permissions/loading!)
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
    
    // Time tracking - FIXED: Add playerHalfTimes
    trackedPlayers: orchestrator.matchState.trackedPlayers,
    selectedTimePlayer: orchestrator.matchState.selectedTimePlayer,
    setSelectedTimePlayer: orchestrator.matchState.setSelectedTimePlayer,
    playerHalfTimes: orchestrator.matchState.playerHalfTimes, // ADDED
    
    // Events
    events: orchestrator.matchState.events,

    // Reset functions and event logger
    resetScore: orchestrator.scoreState.resetScore,
    resetEvents: orchestrator.matchState.resetEvents,
    resetCards: orchestrator.matchState.resetCards,
    resetTracking: orchestrator.matchState.resetTracking,
    resetGoals: orchestrator.matchState.resetGoals,
    addEvent: orchestrator.matchState.addEvent,

    // Save attempts
    saveAttempts: orchestrator.baseState.saveAttempts,

    // Enhanced handlers
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
