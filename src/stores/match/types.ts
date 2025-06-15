
export interface MatchGoal {
  id: string;
  playerId: number;
  playerName: string;
  teamId: string;
  teamName: string;
  team?: 'home' | 'away'; // Add team property for compatibility
  type: 'goal' | 'assist';
  time: number;
  timestamp: number;
  synced: boolean;
  isOwnGoal?: boolean; // CRITICAL: Add own goal support to the type
}

export interface MatchCard {
  id: string;
  playerId: number;
  playerName: string;
  teamId: string;
  teamName: string;
  type: 'yellow' | 'red';
  time: number;
  timestamp: number;
  synced: boolean;
}

export interface MatchPlayerTime {
  id: string;
  playerId: number;
  playerName: string;
  teamId: string;
  teamName: string;
  team?: 'home' | 'away'; // Add team property for compatibility
  totalTime: number;
  isPlaying?: boolean; // Add isPlaying property for compatibility
  startTime?: number; // Add startTime property for compatibility
  periods: Array<{
    start_time: number;
    end_time: number;
    duration: number;
  }>;
  timestamp: number;
  synced: boolean;
}

export interface MatchEvent {
  id: string;
  type: string;
  description: string;
  time: number;
  timestamp: number;
}

export interface MatchState {
  fixtureId: number | null;
  homeScore: number;
  awayScore: number;
  homeTeamName?: string; // Add for team matching in goal slice
  awayTeamName?: string; // Add for team matching in goal slice
  homeTeamId?: string;   // <-- ADDED for ScoreTabContainer type correctness
  awayTeamId?: string;   // <-- ADDED for ScoreTabContainer type correctness
  goals: MatchGoal[];
  cards: MatchCard[];
  playerTimes: MatchPlayerTime[];
  events: MatchEvent[];
  hasUnsavedChanges: boolean;
  lastUpdated: number;
}
