
/**
 * Types for substitution logic
 */
import { ComponentPlayer } from "@/components/referee/hooks/useRefereeState";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { PlayerTime } from "@/types/database";

export type SubstitutionPending = {
  outgoingPlayerId: number;
  outgoingPlayerName: string;
  timestamp: number;
  initiationType: "sub_in" | "sub_out";
};

export type SubstitutionCompleted = {
  outgoing: SubstitutionPending;
  incoming: {
    id: number;
    name: string;
  };
};

export interface SubstitutionManager {
  pendingSubstitution: SubstitutionPending | null;
  hasPendingSubstitution: boolean;
  isSubOutInitiated: boolean;
  initiatePendingSubstitution: (
    player: PlayerTime,
    type: "sub_in" | "sub_out"
  ) => void;
  completePendingSubstitution: (
    incomingPlayer: ProcessedPlayer
  ) => SubstitutionCompleted | null;
  cancelPendingSubstitution: () => void;
}
