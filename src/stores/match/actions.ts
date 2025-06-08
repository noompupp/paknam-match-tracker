
import { MatchGoal, MatchCard, MatchPlayerTime } from './types';

export interface MatchActions {
  // Core actions
  setFixtureId: (id: number | null) => void;
  addGoal: (goal: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => void;
  addAssist: (assist: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => void;
  updateGoal: (goalId: string, updates: Partial<MatchGoal>) => void;
  removeGoal: (goalId: string) => void;
  addCard: (card: Omit<MatchCard, 'id' | 'timestamp' | 'synced'>) => void;
  addPlayerTime: (playerTime: Omit<MatchPlayerTime, 'id' | 'synced'>) => void;
  updatePlayerTime: (playerId: number, updates: Partial<MatchPlayerTime>) => void;
  addEvent: (type: string, description: string, time: number) => void;
  markAsSaved: () => void;
  resetState: () => void;
  triggerUIUpdate: () => void;
  
  // Computed getters
  getUnsavedGoalsCount: () => number;
  getUnsavedCardsCount: () => number;
  getUnassignedGoalsCount: () => number;
  getUnassignedGoals: () => MatchGoal[];
  getUnsavedItemsCount: () => { goals: number; cards: number; playerTimes: number };
}
