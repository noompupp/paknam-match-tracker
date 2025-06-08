
let idCounter = 0;

export const generateId = () => `global_${Date.now()}_${++idCounter}`;

export const createInitialState = () => ({
  fixtureId: null,
  homeScore: 0,
  awayScore: 0,
  goals: [],
  cards: [],
  playerTimes: [],
  events: [],
  lastSaved: null,
  hasUnsavedChanges: false,
  lastUpdated: Date.now()
});
