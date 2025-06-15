
import { useRefereeStateIntegration } from "./useRefereeStateIntegration";
import { useRefereeEnhancedHandlers } from "./useRefereeEnhancedHandlers";

export const useRefereeStateOrchestrator = () => {
  // Get all integrated state
  const {
    baseState,
    scoreState,
    matchState,
    playerData,
    teamSelection,
    playersNeedingAttention,
    handleManualRefresh
  } = useRefereeStateIntegration();

  // Get enhanced handlers
  const enhancedHandlers = useRefereeEnhancedHandlers({
    baseState,
    scoreState,
    matchState,
    playerData
  });

  console.log('🎯 useRefereeStateOrchestrator Summary (Database-Driven Scores):', {
    selectedFixture: baseState.selectedFixture,
    hasSelectedFixtureData: !!baseState.selectedFixtureData,
    totalMembers: baseState.members?.length || 0,
    homePlayersCount: playerData.homeTeamPlayers.length,
    awayPlayersCount: playerData.awayTeamPlayers.length,
    totalPlayersCount: playerData.allPlayers.length,
    enhancedDataValid: playerData.enhancedPlayersData.hasValidData,
    dataIssues: playerData.enhancedPlayersData.dataIssues,
    selectedGoalTeam: teamSelection.selectedGoalTeam,
    selectedTimeTeam: teamSelection.selectedTimeTeam,
    goalFilteredPlayersCount: teamSelection.getGoalFilteredPlayers().length,
    timeFilteredPlayersCount: teamSelection.getTimeFilteredPlayers().length,
    databaseDrivenScore: { homeScore: scoreState.homeScore, awayScore: scoreState.awayScore },
    hasRealTimeSync: !!scoreState.forceRefresh
  });

  return {
    // Base state
    fixtures: baseState.fixtures,
    fixturesLoading: baseState.fixturesLoading,
    selectedFixture: baseState.selectedFixture,
    setSelectedFixture: baseState.setSelectedFixture,
    selectedFixtureData: baseState.selectedFixtureData,
    enhancedPlayersData: playerData.enhancedPlayersData,
    
    // Player data
    allPlayers: playerData.allPlayers,
    homeTeamPlayers: playerData.homeTeamPlayers,
    awayTeamPlayers: playerData.awayTeamPlayers,
    playersForTimeTracker: playerData.playersForTimeTracker,
    playersNeedingAttention,
    
    // Team selections
    selectedGoalTeam: teamSelection.selectedGoalTeam,
    setSelectedGoalTeam: teamSelection.setSelectedGoalTeam,
    selectedTimeTeam: teamSelection.selectedTimeTeam,
    setSelectedTimeTeam: teamSelection.setSelectedTimeTeam,
    getGoalFilteredPlayers: teamSelection.getGoalFilteredPlayers,
    getTimeFilteredPlayers: teamSelection.getTimeFilteredPlayers,
    
    // Timer
    matchTime: baseState.matchTime,
    isRunning: baseState.isRunning,
    formatTime: baseState.formatTime,
    
    // Database-driven score with real-time sync
    homeScore: scoreState.homeScore,
    awayScore: scoreState.awayScore,
    
    // Goals
    goals: matchState.goals,
    selectedGoalPlayer: matchState.selectedGoalPlayer,
    selectedGoalType: matchState.selectedGoalType,
    setSelectedGoalPlayer: matchState.setSelectedGoalPlayer,
    setSelectedGoalType: matchState.setSelectedGoalType,
    
    // Cards
    cards: matchState.cards,
    selectedPlayer: matchState.selectedPlayer,
    selectedTeam: matchState.selectedTeam,
    selectedCardType: matchState.selectedCardType,
    setSelectedPlayer: matchState.setSelectedPlayer,
    setSelectedTeam: matchState.setSelectedTeam,
    setSelectedCardType: matchState.setSelectedCardType,
    
    // Time tracking
    trackedPlayers: matchState.trackedPlayers,
    selectedTimePlayer: matchState.selectedTimePlayer,
    setSelectedTimePlayer: matchState.setSelectedTimePlayer,
    
    // Events
    events: matchState.events,

    // The missing reset functions and event logger passed through from matchState:
    resetScore: matchState.resetScore,
    resetEvents: matchState.resetEvents,
    resetCards: matchState.resetCards,
    resetTracking: matchState.resetTracking,
    resetGoals: matchState.resetGoals,
    addEvent: matchState.addEvent,
    
    // Save attempts
    saveAttempts: baseState.saveAttempts,
    
    // Enhanced handlers with database-driven scores and real-time sync
    handleSaveMatch: enhancedHandlers.handleSaveMatch,
    handleResetMatch: enhancedHandlers.handleResetMatch,
    handleAssignGoal: enhancedHandlers.handleAssignGoal,
    handleAddCard: enhancedHandlers.handleAddCard,
    handleAddPlayer: enhancedHandlers.handleAddPlayer,
    handleRemovePlayer: enhancedHandlers.handleRemovePlayer,
    handleTogglePlayerTime: enhancedHandlers.handleTogglePlayerTime,
    toggleTimer: baseState.toggleTimer,
    resetTimer: baseState.resetTimer,
    assignGoal: matchState.assignGoal,
    removePlayer: matchState.removePlayer,
    addPlayer: matchState.addPlayer,
    forceRefresh: scoreState.forceRefresh, // Expose immediate refresh for components
    resetState: enhancedHandlers.resetState, // Expose reset state for components
    handleManualRefresh // Add the manual refresh handler
  };
};
