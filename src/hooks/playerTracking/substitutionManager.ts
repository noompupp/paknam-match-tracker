
import { useState, useCallback } from "react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface PendingSubstitution {
  outgoingPlayerId: number;
  outgoingPlayerName: string;
  timestamp: number;
}

export const useSubstitutionManager = () => {
  const [pendingSubstitution, setPendingSubstitution] = useState<PendingSubstitution | null>(null);

  const initiatePendingSubstitution = useCallback((player: PlayerTime) => {
    setPendingSubstitution({
      outgoingPlayerId: player.id,
      outgoingPlayerName: player.name,
      timestamp: Date.now()
    });
    
    console.log('🔄 Substitution Manager: Pending substitution initiated for Sub In:', player.name);
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

  return {
    pendingSubstitution,
    hasPendingSubstitution,
    initiatePendingSubstitution,
    completePendingSubstitution,
    cancelPendingSubstitution
  };
};
