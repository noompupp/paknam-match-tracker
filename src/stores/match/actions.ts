
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

  // Core actions
  setFixtureId: (fixtureId: number) => void;
  updateScore: (homeScore: number, awayScore: number) => void;
  markAsSaved: () => void;
  resetMatch: () => void;
  getUnsavedItemsCount: () => number;
}
