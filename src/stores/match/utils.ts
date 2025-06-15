
import { MatchState } from './types';

export const createInitialState = (): MatchState => ({
  fixtureId: null,
  homeScore: 0,
  awayScore: 0,
  homeTeamName: "", // <-- ensure always present for store logic
  awayTeamName: "", // <-- ensure always present for store logic
  homeTeamId: "",   // sensible default for ids
  awayTeamId: "",
  goals: [],
  cards: [],
  playerTimes: [],
  events: [],
  hasUnsavedChanges: false,
  lastUpdated: Date.now()
});

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
