
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

export interface PlayerTime {
  id: number;
  name: string;
  team: string;
  totalTime: number;
  isPlaying: boolean;
  startTime: number | null;
}

export interface EnhancedPlayerTime extends PlayerTime {
  team_id?: string;
  number?: string;
  position?: string;
  role?: string;
  periods?: Array<{
    start_time: number;
    end_time: number;
    duration: number;
  }>;
}

// Conversion utilities
export const convertProcessedPlayerToPlayerTime = (player: ProcessedPlayer, matchTime: number): PlayerTime => {
  return {
    id: player.id,
    name: player.name,
    team: player.team,
    totalTime: 0,
    isPlaying: true,
    startTime: matchTime
  };
};

export const convertPlayerTimeToProcessed = (playerTime: PlayerTime): ProcessedPlayer => {
  return {
    id: playerTime.id,
    name: playerTime.name,
    team: playerTime.team,
    team_id: "",
    number: "",
    position: "Player",
    role: "Starter"
  };
};
