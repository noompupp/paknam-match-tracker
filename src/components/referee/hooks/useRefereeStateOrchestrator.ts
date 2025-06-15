import { useRefereeStateIntegration } from "./useRefereeStateIntegration";
import { useRefereeEnhancedHandlers } from "./useRefereeEnhancedHandlers";
import { useMatchStore } from "@/stores/useMatchStore";

export const useRefereeStateOrchestrator = () => {
  // Get all integrated state
  const orchestrator = useRefereeStateIntegration();
  // Use match store directly for homeScore/awayScore to avoid accidental drift/duplicate
  const { homeScore, awayScore } = useMatchStore();

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
    handleManualRefresh // Add the manual refresh handler
  };
};
