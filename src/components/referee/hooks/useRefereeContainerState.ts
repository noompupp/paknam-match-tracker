
import { useRefereeBaseState } from "./useRefereeBaseState";
import { useRefereeScoreState } from "./useRefereeScoreState";
import { useRefereePlayerData } from "./useRefereePlayerData";
import { useRefereeTeamSelection } from "./useRefereeTeamSelection";
import { useRefereeMatchState } from "./useRefereeMatchState";
import { useRefereeHandlers } from "./useRefereeHandlers";

export const useRefereeContainerState = () => {
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

  // Player data with enhanced processing
  const playerData = useRefereePlayerData({
    selectedFixture: baseState.selectedFixture,
    selectedFixtureData: baseState.selectedFixtureData,
    fixtures: baseState.fixtures,
    members: baseState.members,
    trackedPlayers: matchState.trackedPlayers
  });

  // Team selection management
  const teamSelection = useRefereeTeamSelection({
    selectedFixture: baseState.selectedFixture,
    homeTeamPlayers: playerData.homeTeamPlayers,
    awayTeamPlayers: playerData.awayTeamPlayers
  });

  // Check for players needing attention
  const playersNeedingAttention = matchState.getPlayersNeedingAttentionForMatch(playerData.playersForTimeTracker);

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
    selectedFixtureData: baseState.selectedFixtureData,
    matchTime: baseState.matchTime,
    isRunning: baseState.isRunning,
    formatTime: baseState.formatTime,
    homeScore: scoreState.homeScore,
    awayScore: scoreState.awayScore,
    allPlayers: playerData.allPlayers,
    playersForTimeTracker: playerData.playersForTimeTracker,
    selectedGoalPlayer: matchState.selectedGoalPlayer,
    selectedGoalType: matchState.selectedGoalType,
    selectedTimePlayer: matchState.selectedTimePlayer,
    saveAttempts: baseState.saveAttempts,
    setSaveAttempts: baseState.setSaveAttempts,
    updateFixtureScore: baseState.updateFixtureScore,
    createMatchEvent: baseState.createMatchEvent,
    updatePlayerStats: baseState.updatePlayerStats,
    goals: matchState.goals,
    addGoal: scoreState.addGoal,
    toggleTimer: baseState.toggleTimer,
    resetTimer: baseState.resetTimer,
    resetScore: scoreState.resetScore,
    resetEvents: matchState.resetEvents,
    resetCards: matchState.resetCards,
    resetTracking: matchState.resetTracking,
    resetGoals: matchState.resetGoals,
    addEvent: matchState.addEvent,
    assignGoal: matchState.assignGoal,
    addCard: matchState.addCard,
    addPlayer: matchState.addPlayer,
    removePlayer: matchState.removePlayer,
    togglePlayerTime: matchState.togglePlayerTime,
    checkForSecondYellow: matchState.checkForSecondYellow,
    removeGoal: scoreState.removeGoal,
    forceRefresh: scoreState.forceRefresh
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
    matchState.addPlayer(player, baseState.matchTime);
  };

  const handleTogglePlayerTime = (playerId: number) => {
    matchState.togglePlayerTime(playerId, baseState.matchTime);
  };

  console.log('🎯 useRefereeContainerState Summary (Database-Driven Scores):', {
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
    
    // Save attempts
    saveAttempts: baseState.saveAttempts,
    
    // Enhanced handlers with database-driven scores and real-time sync
    handleSaveMatch,
    handleResetMatch: handleEnhancedResetMatch,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    toggleTimer: baseState.toggleTimer,
    resetTimer: baseState.resetTimer,
    assignGoal: matchState.assignGoal,
    removePlayer: matchState.removePlayer,
    addPlayer: matchState.addPlayer,
    forceRefresh: scoreState.forceRefresh, // Expose immediate refresh for components
    resetState: baseState.resetState || handlersResetState // Expose reset state for components
  };
};
