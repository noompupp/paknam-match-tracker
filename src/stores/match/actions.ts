
import { MatchGoal, MatchCard, MatchPlayerTime } from './types';

export interface MatchActions {
  // Core match actions
  setFixtureId: (fixtureId: number | null) => void;
  setHomeTeamName: (name: string) => void;
  setAwayTeamName: (name: string) => void;
  setHomeScore: (score: number) => void;
  setAwayScore: (score: number) => void;
  setMatchTime: (time: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  resetMatch: () => void;
  setPhase: (phase: string) => void;
  setLastUpdated: (lastUpdated: number) => void;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;

  // Setup method
  setupMatch?: (params: {
    fixtureId: number;
    homeTeamName: string;
    awayTeamName: string;
    homeTeamId: string;
    awayTeamId: string;
  }) => void;

  // Card management methods
  addCard: (card: Omit<MatchCard, 'id' | 'timestamp' | 'synced'>) => MatchCard;
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<MatchCard>) => void;
  getUnsavedCardsCount: () => number;
  syncCardsToDatabase: (fixtureId: number) => Promise<void>;

  // Player Time management methods
  addPlayerTime: (playerTime: Omit<MatchPlayerTime, 'id' | 'timestamp' | 'synced'>) => MatchPlayerTime;
  removePlayerTime: (playerTimeId: string) => void;
  updatePlayerTime: (playerTimeId: string, updates: Partial<MatchPlayerTime>) => void;
  getPlayerTimesByPlayerId: (playerId: number) => MatchPlayerTime[];
  getUnsavedPlayerTimesCount: () => number;
  syncPlayerTimesToDatabase: (fixtureId: number) => Promise<void>;
  loadPlayerTimesFromDatabase: (fixtureId: number) => Promise<void>;
  clearPlayerTimes: () => void;
  getActivePlayersCount: () => number;
  updateAllPlayerTimes?: () => void;
  startPlayerTime?: (playerId: number, time: number) => void;
  stopPlayerTime?: (playerId: number, time: number) => void;
  
  // Enhanced goal management methods
  addGoal: (goalData: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => MatchGoal;
  removeGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<MatchGoal>) => void;
  getUnsavedGoalsCount: () => number;
  syncGoalsToDatabase: (fixtureId: number) => Promise<void>;
  syncScoresFromDatabase: (fixtureId: number) => Promise<void>;
  addAssist: (assistData: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => MatchGoal;
  undoGoal: (goalId: string) => void;
  getUnassignedGoalsCount: () => number;
  getUnassignedGoals: () => MatchGoal[];

  // Event management
  addEvent: (type: string, description: string, time: number) => void;
  
  // UI and state management
  triggerUIUpdate: () => void;
  resetState: () => void;
  markAsSaved?: () => void;
  
  // Batch operations
  flushBatchedEvents: () => Promise<void>;
  syncAllToDatabase: (fixtureId: number) => Promise<void>;
  optimizedBatchSync?: (fixtureId: number) => Promise<void>;

  // Utility methods for counting and status
  getUnsavedItemsCount?: () => {
    goals: number;
    cards: number;
    playerTimes: number;
  };
}
