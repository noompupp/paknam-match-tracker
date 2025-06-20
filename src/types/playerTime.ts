
export interface PlayerHalfTimes {
  firstHalf: number;
  secondHalf: number;
}

export interface EnhancedPlayerTime {
  id: number;
  name: string;
  team: string;
  totalTime: number;
  isPlaying: boolean;
  startTime: number | null;
  halfTimes: PlayerHalfTimes;
  currentHalfStartTime?: number | null; // Track when current half session started
  periods?: Array<{
    start_time: number;
    end_time: number;
    duration: number;
    half: 1 | 2;
  }>;
}
