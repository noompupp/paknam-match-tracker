
import { PlayerTime } from "@/types/database";
import { PlayerHalfTimes, TimerUpdateParams } from "@/types/playerTime";
import { isSecondHalf } from "@/utils/timeUtils";

export class TimerSynchronizer {
  private static instance: TimerSynchronizer;
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Map<string, TimerUpdateCallback> = new Map();

  private constructor() {}

  static getInstance(): TimerSynchronizer {
    if (!TimerSynchronizer.instance) {
      TimerSynchronizer.instance = new TimerSynchronizer();
    }
    return TimerSynchronizer.instance;
  }

  subscribe(id: string, callback: TimerUpdateCallback): () => void {
    this.subscribers.set(id, callback);
    
    // Start the global timer if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startGlobalTimer();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id);
      if (this.subscribers.size === 0) {
        this.stopGlobalTimer();
      }
    };
  }

  private startGlobalTimer(): void {
    if (this.intervalId) return;

    console.log('🔄 Starting global timer synchronizer');
    this.intervalId = setInterval(() => {
      const now = Date.now();
      this.subscribers.forEach((callback, id) => {
        try {
          callback();
        } catch (error) {
          console.error(`Timer sync error for subscriber ${id}:`, error);
        }
      });
    }, 1000);
  }

  private stopGlobalTimer(): void {
    if (this.intervalId) {
      console.log('⏹️ Stopping global timer synchronizer');
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Utility method to calculate timer updates without stale closures
  static calculatePlayerTimeUpdates(
    players: PlayerTime[],
    playerHalfTimes: Map<number, PlayerHalfTimes>,
    matchTime: number
  ): {
    updatedPlayers: PlayerTime[];
    updatedHalfTimes: Map<number, PlayerHalfTimes>;
  } {
    const currentHalf = isSecondHalf(matchTime) ? 2 : 1;
    const updatedPlayers = players.map(player => {
      if (player.isPlaying) {
        return {
          ...player,
          totalTime: player.totalTime + 1
        };
      }
      return player;
    });

    const updatedHalfTimes = new Map(playerHalfTimes);
    players.forEach(player => {
      if (player.isPlaying) {
        const halfTimes = updatedHalfTimes.get(player.id) || { firstHalf: 0, secondHalf: 0 };
        
        if (currentHalf === 1) {
          halfTimes.firstHalf += 1;
        } else {
          halfTimes.secondHalf += 1;
        }
        
        updatedHalfTimes.set(player.id, halfTimes);
        
        console.log('⏱️ Updated half times for', player.name, ':', {
          currentHalf,
          firstHalf: `${Math.floor(halfTimes.firstHalf / 60)}:${String(halfTimes.firstHalf % 60).padStart(2, '0')}`,
          secondHalf: `${Math.floor(halfTimes.secondHalf / 60)}:${String(halfTimes.secondHalf % 60).padStart(2, '0')}`,
          totalTime: `${Math.floor((player.totalTime + 1) / 60)}:${String((player.totalTime + 1) % 60).padStart(2, '0')}`,
          matchTime: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`
        });
      }
    });

    return { updatedPlayers, updatedHalfTimes };
  }
}

type TimerUpdateCallback = () => void;
