
export interface MatchGoal {
  id: string;
  playerId?: number;
  playerName: string;
  team: 'home' | 'away';
  teamId: string;
  teamName: string;
  type: 'goal' | 'assist';
  time: number;
  isOwnGoal?: boolean;
  assistPlayerId?: number;
  assistPlayerName?: string;
  timestamp: number;
  synced: boolean;
}

export interface MatchCard {
  id: string;
  playerId: number;
  playerName: string;
  team: 'home' | 'away';
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
  team: 'home' | 'away';
  teamId: string;
  teamName: string;
  totalTime: number;
  startTime: number | null;
  isPlaying: boolean;
  periods: Array<{
    start_time: number;
    end_time: number;
    duration: number;
  }>;
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
  lastSaved: number | null;
  hasUnsavedChanges: boolean;
  lastUpdated: number;
}
