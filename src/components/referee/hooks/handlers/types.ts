
export interface MatchTeamData {
  id: string | number;
  name: string;
}

export interface MatchGoalData {
  playerId: number;
  playerName: string;
  team: string;
  type: "goal" | "assist";
  time: number;
  isOwnGoal?: boolean;
}

export interface MatchPlayerTimeData {
  id: number;
  name: string;
  team: string;
  totalTime: number;
  startTime?: number;
}

export interface UseMatchDataHandlersProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  goals: any[];
  playersForTimeTracker: MatchPlayerTimeData[];
  matchTime: number;
  setSaveAttempts: (value: number | ((prev: number) => number)) => void;
  resetTimer: () => void;
  resetScore: () => void;
  resetEvents: () => void;
  resetCards: () => void;
  resetTracking: () => void;
  resetGoals: () => void;
  addEvent: (type: string, description: string, time: number) => void;
  forceRefresh?: () => Promise<void>;
}
