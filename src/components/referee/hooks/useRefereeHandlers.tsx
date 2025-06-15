
import { ComponentPlayer, PlayerTimeTrackerPlayer } from "./useRefereeState";
import { useMatchControlHandlers } from "./handlers/useMatchControlHandlers";
import { useGoalHandlers } from "./handlers/useGoalHandlers";
import { useCardHandlers } from "./handlers/useCardHandlers";
import { usePlayerTimeHandlers } from "./handlers/usePlayerTimeHandlers";
import { useMatchDataHandlers } from "./handlers/useMatchDataHandlers";
import { useExportHandlers } from "./handlers/useExportHandlers";

interface UseRefereeHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  allPlayers: ComponentPlayer[];
  playersForTimeTracker: PlayerTimeTrackerPlayer[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedTimePlayer: string;
  saveAttempts: number;
  setSaveAttempts: (value: number | ((prev: number) => number)) => void;
  updateFixtureScore: any;
  createMatchEvent: any;
  updatePlayerStats: any;
  goals: any[];
  addGoal: (team: 'home' | 'away') => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  resetScore: () => void;
  resetEvents: () => void;
  resetCards: () => void;
  resetTracking: () => void;
  resetGoals: () => void;
  addEvent: (type: string, description: string, time: number) => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  addCard: (player: ComponentPlayer, team: string, matchTime: number, cardType: 'yellow' | 'red') => any;
  addPlayer: (player: ComponentPlayer, matchTime: number) => any;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number, matchTime: number) => any;
  checkForSecondYellow: (playerName: string) => boolean;
  removeGoal: (team: 'home' | 'away') => void;
  forceRefresh?: () => Promise<void>;
}

export const useRefereeHandlers = (props: UseRefereeHandlersProps) => {
  // Match control handlers
  const matchControlHandlers = useMatchControlHandlers({
    matchTime: props.matchTime,
    isRunning: props.isRunning,
    formatTime: props.formatTime,
    toggleTimer: props.toggleTimer,
    resetTimer: props.resetTimer,
    resetScore: props.resetScore,
    resetEvents: props.resetEvents,
    resetCards: props.resetCards,
    resetTracking: props.resetTracking,
    resetGoals: props.resetGoals,
    addEvent: props.addEvent
  });

  // Goal handlers
  const goalHandlers = useGoalHandlers({
    selectedFixtureData: props.selectedFixtureData,
    matchTime: props.matchTime,
    selectedGoalType: props.selectedGoalType,
    addGoal: props.addGoal,
    removeGoal: props.removeGoal,
    addEvent: props.addEvent,
    assignGoal: props.assignGoal,
    updateFixtureScore: props.updateFixtureScore
  });

  // Card handlers
  const cardHandlers = useCardHandlers({
    allPlayers: props.allPlayers,
    matchTime: props.matchTime,
    selectedFixtureData: props.selectedFixtureData,
    addCard: props.addCard,
    addEvent: props.addEvent
  });

  // Adapter for PlayerTime -> ComponentPlayer
  const addPlayerAdapter = (player: any, matchTime: number) => {
    // Try to find actual ComponentPlayer by id
    const found = props.allPlayers.find(p => p.id === player.id);
    if (found) {
      return props.addPlayer(found, matchTime);
    }
    // Fallback: best-effort minimal ComponentPlayer
    const fallback: ComponentPlayer = {
      id: player.id,
      name: player.name,
      team_id: player.team_id || "",
      number: player.number || "",
      position: player.position || "Player",
      role: player.role || "Starter",
      team: player.team || "",
    };
    return props.addPlayer(fallback, matchTime);
  };

  // Player time handlers
  const playerTimeHandlers = usePlayerTimeHandlers({
    selectedFixtureData: props.selectedFixtureData,
    matchTime: props.matchTime,
    playersForTimeTracker: props.playersForTimeTracker,
    addPlayer: addPlayerAdapter,
    removePlayer: props.removePlayer,
    togglePlayerTime: props.togglePlayerTime,
    addEvent: props.addEvent
  });

  // Enhanced match data handlers with reset state coordination
  const matchDataHandlers = useMatchDataHandlers({
    selectedFixtureData: props.selectedFixtureData,
    homeScore: props.homeScore,
    awayScore: props.awayScore,
    goals: props.goals,
    playersForTimeTracker: props.playersForTimeTracker,
    matchTime: props.matchTime,
    setSaveAttempts: props.setSaveAttempts,
    resetTimer: props.resetTimer,
    resetScore: props.resetScore,
    resetEvents: props.resetEvents,
    resetCards: props.resetCards,
    resetTracking: props.resetTracking,
    resetGoals: props.resetGoals,
    addEvent: props.addEvent,
    forceRefresh: props.forceRefresh
  });

  // Export handlers
  const exportHandlers = useExportHandlers({
    selectedFixtureData: props.selectedFixtureData,
    homeScore: props.homeScore,
    awayScore: props.awayScore,
    matchTime: props.matchTime,
    goals: props.goals,
    playersForTimeTracker: props.playersForTimeTracker
  });

  return {
    handleAddGoal: goalHandlers.handleAddGoal,
    handleRemoveGoal: goalHandlers.handleRemoveGoal,
    handleToggleTimer: matchControlHandlers.handleToggleTimer,
    handleResetMatch: matchControlHandlers.handleResetMatch,
    handleSaveMatch: matchDataHandlers.handleSaveMatch,
    handleAssignGoal: goalHandlers.handleAssignGoal,
    handleAddCard: cardHandlers.handleAddCard,
    handleAddPlayer: playerTimeHandlers.handleAddPlayer,
    handleRemovePlayer: playerTimeHandlers.handleRemovePlayer,
    handleTogglePlayerTime: playerTimeHandlers.handleTogglePlayerTime,
    handleExportSummary: exportHandlers.handleExportSummary,
    handleSaveAllPlayerTimes: playerTimeHandlers.handleSaveAllPlayerTimes,
    handleResetMatchData: matchDataHandlers.handleResetMatchData,
    handleCleanupDuplicates: matchDataHandlers.handleCleanupDuplicates,
    resetState: matchDataHandlers.resetState // Expose reset state for coordination
  };
};
