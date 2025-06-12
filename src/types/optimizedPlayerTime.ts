
// Extended PlayerTime interface for optimized tracking
export interface OptimizedPlayerTime {
  id: number;
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

export interface SyncStatus {
  lastSyncTime: number | null;
  pendingChanges: number;
  isSyncing: boolean;
  lastError: string | null;
}
