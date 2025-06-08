
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
    
    // Score state
    homeScore,
    awayScore,
    addGoal,
    removeGoal,
    resetScore,
    
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
    updatePlayerStats
  } = useRefereeState();

  // Use the comprehensive referee handlers
  const {
    handleSaveMatch,
    handleResetMatch,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer: handleAddPlayerWithSave,
    handleRemovePlayer,
    handleTogglePlayerTime: handleTogglePlayerTimeWithSave
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
    checkForSecondYellow: () => false, // Placeholder
    removeGoal
  });

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
    
    // Score
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
    
    // Handlers
    handleSaveMatch,
    handleResetMatch,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    toggleTimer,
    resetTimer,
    assignGoal,
    removePlayer,
    addPlayer
  };
};
