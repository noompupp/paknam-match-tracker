export interface MatchGoal {
  id: string;
  playerId: number;
  playerName: string;
  teamId: string;
  teamName: string;
  team: 'home' | 'away';
  type: 'goal' | 'assist';
  time: number;
  timestamp: number;
  synced: boolean;
  assistPlayerName?: string;
  assistTeamId?: string;
  isOwnGoal?: boolean; // Standardized own goal flag
}

export interface MatchCard {
  id: string;
  playerId: number;
  playerName: string;
  teamId: string;
  teamName: string;
  team: 'home' | 'away';
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
  team: 'home' | 'away';
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
  hasUnsavedChanges: boolean;
  lastUpdated: number;
  
  // New optimized tracking properties
  localPlayerTimes: any[];
  isLocalTimerActive: boolean;
  syncStatus: {
    lastSyncTime: number | null;
    pendingChanges: number;
    isSyncing: boolean;
    lastError: string | null;
  };
  autoSyncEnabled: boolean;
  manualSyncOnly: boolean;
}
