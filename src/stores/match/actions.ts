import { MatchGoal, MatchCard, MatchPlayerTime } from './types';

export interface MatchActions {
  // Goal actions
  addGoal: (goalData: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => MatchGoal;
  addAssist: (assistData: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => MatchGoal;
  updateGoal: (goalId: string, updates: Partial<MatchGoal>) => void;
  removeGoal: (goalId: string) => void;
  undoGoal: (goalId: string) => void;
  getUnassignedGoalsCount: () => number;
  getUnassignedGoals: () => MatchGoal[];
  getUnsavedGoalsCount: () => number;

  // Card actions
  addCard: (cardData: Omit<MatchCard, 'id' | 'timestamp' | 'synced'>) => MatchCard;
  updateCard: (cardId: string, updates: Partial<MatchCard>) => void;
  removeCard: (cardId: string) => void;
  getUnsavedCardsCount: () => number;

  // Player time actions
  addPlayerTime: (playerTimeData: Omit<MatchPlayerTime, 'id' | 'timestamp' | 'synced'>) => MatchPlayerTime;
  updatePlayerTime: (playerTimeId: string, updates: Partial<MatchPlayerTime>) => void;
  removePlayerTime: (playerTimeId: string) => void;
  getUnsavedPlayerTimesCount: () => number;
  getActivePlayersCount: () => number;
  startPlayerTime: (playerTimeId: string) => void;
  stopPlayerTime: (playerTimeId: string) => void;
  togglePlayerTime: (playerTimeId: string) => void;
  updateAllPlayerTimes: () => void;

  // Database sync actions
  loadPlayerTimesFromDatabase: (fixtureId: number) => Promise<void>;
  syncPlayerTimesToDatabase: (fixtureId: number) => Promise<void>;
  syncGoalsToDatabase: (fixtureId: number) => Promise<void>;
  syncCardsToDatabase: (fixtureId: number) => Promise<void>;
  optimizedBatchSync: (fixtureId: number) => Promise<void>;
  syncAllToDatabase: (fixtureId: number) => Promise<void>;

  // Utility actions
  clearPlayerTimes: () => void;
  addEvent: (eventType: string, description: string, time: number) => void;
  triggerUIUpdate: () => void;
  resetState: () => void;

  // Core actions
  setupMatch: (data: {
    fixtureId: number;
    homeTeamName: string;
    awayTeamName: string;
    homeTeamId?: string;
    awayTeamId?: string;
  }) => void;
  setFixtureId: (fixtureId: number) => void;
  updateScore: (homeScore: number, awayScore: number) => void;
  markAsSaved: () => void;
  resetMatch: () => void;
  getUnsavedItemsCount: () => { goals: number; cards: number; playerTimes: number };

  // Batch flush actions
  flushBatchedEvents: () => Promise<void>;
}
