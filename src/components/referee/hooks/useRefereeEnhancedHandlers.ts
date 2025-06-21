
import { useRefereeHandlers } from "./useRefereeHandlers";
import type { ComponentPlayer } from "./useRefereeState";

interface UseRefereeEnhancedHandlersProps {
  baseState: any;
  scoreState: any;
  matchState: any;
  playerData: any;
}

export const useRefereeEnhancedHandlers = ({
  baseState,
  scoreState,
  matchState,
  playerData
}: UseRefereeEnhancedHandlersProps) => {
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
    console.log('🔄 useRefereeEnhancedHandlers: Starting enhanced reset with state coordination...');
    
    // Use the enhanced reset handler with state coordination
    await handleResetMatchData();
    
    console.log('✅ useRefereeEnhancedHandlers: Enhanced reset completed with state coordination');
  };

  // FIXED: Create wrapper functions that properly handle matchTime parameter
  const handleAddPlayer = (player: ComponentPlayer) => {
    console.log('👤 Enhanced Handlers - Adding player with matchTime:', {
      playerId: player.id,
      playerName: player.name,
      matchTime: baseState.matchTime,
      matchTimeFormatted: `${Math.floor(baseState.matchTime / 60)}:${String(baseState.matchTime % 60).padStart(2, '0')}`
    });
    
    // Pass both player and matchTime to the underlying function
    return matchState.addPlayer(player, baseState.matchTime);
  };

  const handleTogglePlayerTime = (playerId: number) => {
    console.log('⏱️ Enhanced Handlers - Toggling player time with matchTime:', {
      playerId,
      matchTime: baseState.matchTime,
      matchTimeFormatted: `${Math.floor(baseState.matchTime / 60)}:${String(baseState.matchTime % 60).padStart(2, '0')}`
    });
    
    // CRITICAL FIX: Pass both playerId and matchTime to the underlying function
    return matchState.togglePlayerTime(playerId, baseState.matchTime);
  };

  return {
    handleSaveMatch,
    handleResetMatch: handleEnhancedResetMatch,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    resetState: baseState.resetState || handlersResetState
  };
};
