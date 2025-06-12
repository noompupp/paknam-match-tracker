
export interface MatchGoal {
  id: string;
  playerId: number;
  playerName: string;
  teamId: string;
  teamName: string;
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
  totalTime: number;
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
  goals: MatchGoal[];
  cards: MatchCard[];
  playerTimes: MatchPlayerTime[];
  events: MatchEvent[];
  hasUnsavedChanges: boolean;
  lastUpdated: number;
}
