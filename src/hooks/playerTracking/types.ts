
import { PlayerTime } from "@/types/database";

export interface PlayerConstraints {
  maxPerHalf: number | null;
  minTotal: number;
  warningPerHalf: number | null;
}

export interface PlayerHalfTimes {
  firstHalf: number;
  secondHalf: number;
}

export interface RoleBasedNotification {
  playerId: number;
  playerName: string;
  role: string;
  type: 'warning' | 'limit_reached' | 'auto_stopped' | 'minimum_needed';
  message: string;
}

export type TimeStatus = 'normal' | 'warning' | 'critical' | 'exceeded' | 'insufficient';

export interface PlayerValidationResult {
  player: PlayerTime;
  role: string;
  wasAutoStopped: boolean;
  validation: any;
}
