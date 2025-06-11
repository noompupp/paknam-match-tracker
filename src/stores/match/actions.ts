
import { MatchGoal, MatchCard, MatchPlayerTime, MatchEvent } from './types';

export interface MatchActions {
  // Goal management
  addGoal: (goalData: Omit<MatchGoal, 'id' | 'timestamp' | 'synced'>) => MatchGoal;
  addAssist: (assistData: Omit<MatchGoal, 'id' | 'timestamp' | 'synced' | 'type'>) => MatchGoal;
  updateGoal: (goalId: string, updates: Partial<MatchGoal>) => void;
  removeGoal: (goalId: string) => void;
  undoGoal: (goalId: string) => void;
  getUnassignedGoalsCount: () => number;
  getUnassignedGoals: () => MatchGoal[];

  // Card management with enhanced sync
  addCard: (cardData: Omit<MatchCard, 'id' | 'timestamp' | 'synced'>) => MatchCard;
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<MatchCard>) => void;
  getUnsavedCardsCount: () => number;
  syncCardsToDatabase: (fixtureId: number) => Promise<void>;

  // Player time management with auto-save on sub-in
  addPlayerTime: (playerData: Omit<MatchPlayerTime, 'id' | 'synced'>) => MatchPlayerTime;
  updatePlayerTime: (playerId: number, updates: Partial<MatchPlayerTime>) => void;
  startPlayerTime: (playerId: number, playerName: string, teamId: number) => void;
  stopPlayerTime: (playerId: number) => void;
  autoSaveOnSubIn: (playerId: number, playerName: string, teamId: number) => Promise<void>;
  getPlayerTimesByFixture: (fixtureId: number) => MatchPlayerTime[];
  calculateTotalMinutesPlayed: (playerId: number) => number;
  getActivePlayersCount: () => number;

  // Core state management
  setFixtureId: (id: number | null) => void;
  addEvent: (type: string, description: string, time: number) => void;
  markAsSaved: () => void;
  resetState: () => void;
  triggerUIUpdate: () => void;
  getUnsavedItemsCount: () => { goals: number; cards: number; playerTimes: number };
}
