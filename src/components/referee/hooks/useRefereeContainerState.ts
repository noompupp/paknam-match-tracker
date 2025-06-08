
import { useRefereeState } from "./useRefereeState";
import { useRefereeHandlers } from "./useRefereeHandlers";

export const useRefereeContainerState = () => {
  const {
    // Data
    fixtures,
    fixturesLoading,
    selectedFixture,
    setSelectedFixture,
    selectedFixtureData,
    
    // Enhanced player data with team filtering
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    playersForTimeTracker,
    
    // Team selection for Goals and Time tabs
    selectedGoalTeam,
    setSelectedGoalTeam,
    selectedTimeTeam,
    setSelectedTimeTeam,
    
    // Timer state
    matchTime,
    isRunning,
    toggleTimer,
    resetTimer,
    formatTime,
    
    // Database-driven score state with real-time sync
    homeScore,
    awayScore,
    addGoal,
    removeGoal,
    resetScore,
    forceRefresh,
    
    // Goal state
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    assignGoal,
    resetGoals,
    
    // Card state
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    addCard,
    resetCards,
    
    // Player tracking state
    trackedPlayers,
    selectedTimePlayer,
    setSelectedTimePlayer,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    resetTracking,
    
    // Events
    events,
    addEvent,
    resetEvents,
    
    // Enhanced data status
    enhancedPlayersData,
    
    // Save attempts tracking
    saveAttempts,
    setSaveAttempts,
    
    // Database mutation hooks
    updateFixtureScore,
    createMatchEvent,
    updatePlayerStats,
    
    // Reset state coordination
    resetState
  } = useRefereeState();

  // Enhanced referee handlers with reset state coordination
  const {
    handleSaveMatch,
    handleResetMatch,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer: handleAddPlayerWithSave,
    handleRemovePlayer,
    handleTogglePlayerTime: handleTogglePlayerTimeWithSave,
    handleResetMatchData,
    resetState: handlersResetState
  } = useRefereeHandlers({
    selectedFixtureData,
    matchTime,
    isRunning,
    formatTime,
    homeScore,
    awayScore,
    allPlayers,
    playersForTimeTracker,
    selectedGoalPlayer,
    selectedGoalType,
    selectedTimePlayer,
    saveAttempts,
    setSaveAttempts,
    updateFixtureScore,
    createMatchEvent,
    updatePlayerStats,
    goals,
    addGoal,
    toggleTimer,
    resetTimer,
    resetScore,
    resetEvents,
    resetCards,
    resetTracking,
    resetGoals,
    addEvent,
    assignGoal,
    addCard,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    checkForSecondYellow: () => false,
    removeGoal,
    forceRefresh
  });

  // Enhanced reset handler that uses the coordinated reset from handlers
  const handleEnhancedResetMatch = async () => {
    console.log('🔄 useRefereeContainerState: Starting enhanced reset with state coordination...');
    
    // Use the enhanced reset handler with state coordination
    await handleResetMatchData();
    
    console.log('✅ useRefereeContainerState: Enhanced reset completed with state coordination');
  };

  // Create wrapper functions that handle matchTime internally for basic operations
  const handleAddPlayer = (player: any) => {
    addPlayer(player, matchTime);
  };

  const handleTogglePlayerTime = (playerId: number) => {
    togglePlayerTime(playerId, matchTime);
  };

  return {
    // Base state
    fixtures,
    fixturesLoading,
    selectedFixture,
    setSelectedFixture,
    selectedFixtureData,
    enhancedPlayersData,
    
    // Player data
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    playersForTimeTracker,
    
    // Team selections
    selectedGoalTeam,
    setSelectedGoalTeam,
    selectedTimeTeam,
    setSelectedTimeTeam,
    
    // Timer
    matchTime,
    isRunning,
    formatTime,
    
    // Database-driven score with real-time sync
    homeScore,
    awayScore,
    
    // Goals
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    
    // Cards
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    
    // Time tracking
    trackedPlayers,
    selectedTimePlayer,
    setSelectedTimePlayer,
    
    // Events
    events,
    
    // Save attempts
    saveAttempts,
    
    // Enhanced handlers with database-driven scores and real-time sync
    handleSaveMatch,
    handleResetMatch: handleEnhancedResetMatch,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    toggleTimer,
    resetTimer,
    assignGoal,
    removePlayer,
    addPlayer,
    forceRefresh, // Expose immediate refresh for components
    resetState: resetState || handlersResetState // Expose reset state for components
  };
};
