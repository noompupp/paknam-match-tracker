
import { useState, useCallback } from "react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface PendingSubstitution {
  outgoingPlayerId: number;
  outgoingPlayerName: string;
  timestamp: number;
  initiationType: 'sub_in' | 'sub_out'; // Track how the substitution was initiated
}

export const useSubstitutionManager = () => {
  const [pendingSubstitution, setPendingSubstitution] = useState<PendingSubstitution | null>(null);

  const initiatePendingSubstitution = useCallback((player: PlayerTime, type: 'sub_in' | 'sub_out' = 'sub_in') => {
    setPendingSubstitution({
      outgoingPlayerId: player.id,
      outgoingPlayerName: player.name,
      timestamp: Date.now(),
      initiationType: type
    });
    
    console.log(`🔄 Substitution Manager: Pending substitution initiated via ${type}:`, player.name);
  }, []);

  const completePendingSubstitution = useCallback((incomingPlayer: ProcessedPlayer) => {
    if (!pendingSubstitution) return null;
    
    const substitution = {
      outgoing: pendingSubstitution,
      incoming: {
        id: incomingPlayer.id,
        name: incomingPlayer.name
      }
    };
    
    setPendingSubstitution(null);
    console.log('✅ Substitution Manager: Completed substitution:', substitution);
    
    return substitution;
  }, [pendingSubstitution]);

  const cancelPendingSubstitution = useCallback(() => {
    if (pendingSubstitution) {
      console.log('❌ Substitution Manager: Cancelled pending substitution for:', pendingSubstitution.outgoingPlayerName);
      setPendingSubstitution(null);
    }
  }, [pendingSubstitution]);

  const hasPendingSubstitution = Boolean(pendingSubstitution);
  const isSubOutInitiated = pendingSubstitution?.initiationType === 'sub_out';

  return {
    pendingSubstitution,
    hasPendingSubstitution,
    isSubOutInitiated,
    initiatePendingSubstitution,
    completePendingSubstitution,
    cancelPendingSubstitution
  };
};
