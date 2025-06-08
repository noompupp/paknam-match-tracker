
export interface LocalGoal {
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

export interface LocalCard {
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

export interface LocalPlayerTime {
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

export interface LocalMatchState {
  homeScore: number;
  awayScore: number;
  goals: LocalGoal[];
  cards: LocalCard[];
  playerTimes: LocalPlayerTime[];
  events: Array<{
    id: string;
    type: string;
    description: string;
    time: number;
    timestamp: number;
  }>;
  lastSaved: number | null;
  hasUnsavedChanges: boolean;
}

export interface UseLocalMatchStateProps {
  fixtureId?: number;
  initialHomeScore?: number;
  initialAwayScore?: number;
}
