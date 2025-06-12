
import { MatchState } from './types';

export const createInitialState = (): MatchState => ({
  fixtureId: null,
  homeScore: 0,
  awayScore: 0,
  goals: [],
  cards: [],
  playerTimes: [],
  events: [],
  hasUnsavedChanges: false,
  lastUpdated: Date.now(),
  
  // New optimized tracking properties
  localPlayerTimes: [],
  isLocalTimerActive: false,
  syncStatus: {
    lastSyncTime: null,
    pendingChanges: 0,
    isSyncing: false,
    lastError: null
  },
  autoSyncEnabled: true,
  manualSyncOnly: false
});

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
