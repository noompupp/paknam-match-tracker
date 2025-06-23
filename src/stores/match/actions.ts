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
  
  // Enhanced goal management methods
  addGoal: (goalData: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => MatchGoal;
  removeGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<MatchGoal>) => void;
  getUnsavedGoalsCount: () => number;
  syncGoalsToDatabase: (fixtureId: number) => Promise<void>;
  syncScoresFromDatabase: (fixtureId: number) => Promise<void>;
}
