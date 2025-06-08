
import { useState, useCallback } from "react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import ForcedSubstitutionModal from "./ForcedSubstitutionModal";
import { validateReEntry, validateSubstitution } from "./substitutionValidationUtils";
import { useToast } from "@/hooks/use-toast";

interface ReEntryManagerProps {
  trackedPlayers: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  onPlayerToggle: (playerId: number) => void;
  onForcedSubstitution: (playerInId: number, playerOutId: number) => void;
}

const ReEntryManager = ({
  trackedPlayers,
  allPlayers,
  onPlayerToggle,
  onForcedSubstitution
}: ReEntryManagerProps) => {
  const [showForcedSubModal, setShowForcedSubModal] = useState(false);
  const [pendingReEntry, setPendingReEntry] = useState<PlayerTime | null>(null);
  const [availableForSubstitution, setAvailableForSubstitution] = useState<PlayerTime[]>([]);
  const { toast } = useToast();

  const handlePlayerToggleRequest = useCallback((playerId: number) => {
    const player = trackedPlayers.find(p => p.id === playerId);
    if (!player) {
      console.error('❌ ReEntryManager: Player not found:', playerId);
      return;
    }

    console.log('🔄 ReEntryManager: Handling toggle request for:', {
      playerName: player.name,
      isCurrentlyPlaying: player.isPlaying,
      totalTime: player.totalTime,
      activePlayersCount: trackedPlayers.filter(p => p.isPlaying).length
    });

    // If player is currently playing, allow normal toggle (sub out)
    if (player.isPlaying) {
      console.log('✅ ReEntryManager: Normal sub out - allowing toggle');
      onPlayerToggle(playerId);
      return;
    }

    // Player is not playing, check if this is a re-entry situation
    const reEntryValidation = validateReEntry(player, trackedPlayers);
    
    if (!reEntryValidation.needsForcedSubstitution) {
      console.log('✅ ReEntryManager: Normal sub in - allowing toggle');
      onPlayerToggle(playerId);
      return;
    }

    // Forced substitution required
    console.log('⚠️ ReEntryManager: Forced substitution required:', {
      reason: reEntryValidation.reason,
      availablePlayersCount: reEntryValidation.availableForSubstitution.length
    });

    if (reEntryValidation.availableForSubstitution.length === 0) {
      toast({
        title: "Cannot Re-enter",
        description: "No active players available for substitution",
        variant: "destructive"
      });
      return;
    }

    // Show forced substitution modal
    setPendingReEntry(player);
    setAvailableForSubstitution(reEntryValidation.availableForSubstitution);
    setShowForcedSubModal(true);
  }, [trackedPlayers, onPlayerToggle, onForcedSubstitution, toast]);

  const handleForcedSubstitutionConfirm = useCallback((playerToSubOut: PlayerTime) => {
    if (!pendingReEntry) {
      console.error('❌ ReEntryManager: No pending re-entry player');
      return;
    }

    console.log('🔄 ReEntryManager: Confirming forced substitution:', {
      playerIn: pendingReEntry.name,
      playerOut: playerToSubOut.name
    });

    // Validate the substitution
    const substitutionValidation = validateSubstitution(
      pendingReEntry,
      playerToSubOut,
      trackedPlayers
    );

    if (!substitutionValidation.canProceed) {
      toast({
        title: "Substitution Failed",
        description: substitutionValidation.reason,
        variant: "destructive"
      });
      return;
    }

    // Perform the forced substitution
    onForcedSubstitution(pendingReEntry.id, playerToSubOut.id);

    // Show success message
    toast({
      title: "🔄 Forced Substitution Complete",
      description: `${playerToSubOut.name} → ${pendingReEntry.name}`,
    });

    // Clean up
    setPendingReEntry(null);
    setAvailableForSubstitution([]);
    setShowForcedSubModal(false);
  }, [pendingReEntry, trackedPlayers, onForcedSubstitution, toast]);

  const handleModalClose = useCallback(() => {
    console.log('❌ ReEntryManager: Forced substitution cancelled');
    setPendingReEntry(null);
    setAvailableForSubstitution([]);
    setShowForcedSubModal(false);
  }, []);

  return (
    <>
      <ForcedSubstitutionModal
        isOpen={showForcedSubModal}
        onClose={handleModalClose}
        playerToReEnter={pendingReEntry}
        availableForSubstitution={availableForSubstitution}
        allPlayers={allPlayers}
        onConfirmSubstitution={handleForcedSubstitutionConfirm}
      />
      
      {/* Expose the handler function through a custom method */}
      <div style={{ display: 'none' }} data-handler="handlePlayerToggleRequest" />
    </>
  );
};

// Export the hook for accessing the handler
export const useReEntryManager = (
  trackedPlayers: PlayerTime[],
  allPlayers: ProcessedPlayer[],
  onPlayerToggle: (playerId: number) => void,
  onForcedSubstitution: (playerInId: number, playerOutId: number) => void
) => {
  const [showForcedSubModal, setShowForcedSubModal] = useState(false);
  const [pendingReEntry, setPendingReEntry] = useState<PlayerTime | null>(null);
  const [availableForSubstitution, setAvailableForSubstitution] = useState<PlayerTime[]>([]);
  const { toast } = useToast();

  const handlePlayerToggleRequest = useCallback((playerId: number) => {
    const player = trackedPlayers.find(p => p.id === playerId);
    if (!player) {
      console.error('❌ ReEntryManager: Player not found:', playerId);
      return;
    }

    console.log('🔄 ReEntryManager: Handling toggle request for:', {
      playerName: player.name,
      isCurrentlyPlaying: player.isPlaying,
      totalTime: player.totalTime,
      activePlayersCount: trackedPlayers.filter(p => p.isPlaying).length
    });

    // If player is currently playing, allow normal toggle (sub out)
    if (player.isPlaying) {
      console.log('✅ ReEntryManager: Normal sub out - allowing toggle');
      onPlayerToggle(playerId);
      return;
    }

    // Player is not playing, check if this is a re-entry situation
    const reEntryValidation = validateReEntry(player, trackedPlayers);
    
    if (!reEntryValidation.needsForcedSubstitution) {
      console.log('✅ ReEntryManager: Normal sub in - allowing toggle');
      onPlayerToggle(playerId);
      return;
    }

    // Forced substitution required
    console.log('⚠️ ReEntryManager: Forced substitution required:', {
      reason: reEntryValidation.reason,
      availablePlayersCount: reEntryValidation.availableForSubstitution.length
    });

    if (reEntryValidation.availableForSubstitution.length === 0) {
      toast({
        title: "Cannot Re-enter",
        description: "No active players available for substitution",
        variant: "destructive"
      });
      return;
    }

    // Show forced substitution modal
    setPendingReEntry(player);
    setAvailableForSubstitution(reEntryValidation.availableForSubstitution);
    setShowForcedSubModal(true);
  }, [trackedPlayers, onPlayerToggle, onForcedSubstitution, toast]);

  const handleForcedSubstitutionConfirm = useCallback((playerToSubOut: PlayerTime) => {
    if (!pendingReEntry) {
      console.error('❌ ReEntryManager: No pending re-entry player');
      return;
    }

    console.log('🔄 ReEntryManager: Confirming forced substitution:', {
      playerIn: pendingReEntry.name,
      playerOut: playerToSubOut.name
    });

    // Validate the substitution
    const substitutionValidation = validateSubstitution(
      pendingReEntry,
      playerToSubOut,
      trackedPlayers
    );

    if (!substitutionValidation.canProceed) {
      toast({
        title: "Substitution Failed",
        description: substitutionValidation.reason,
        variant: "destructive"
      });
      return;
    }

    // Perform the forced substitution
    onForcedSubstitution(pendingReEntry.id, playerToSubOut.id);

    // Show success message
    toast({
      title: "🔄 Forced Substitution Complete",
      description: `${playerToSubOut.name} → ${pendingReEntry.name}`,
    });

    // Clean up
    setPendingReEntry(null);
    setAvailableForSubstitution([]);
    setShowForcedSubModal(false);
  }, [pendingReEntry, trackedPlayers, onForcedSubstitution, toast]);

  const handleModalClose = useCallback(() => {
    console.log('❌ ReEntryManager: Forced substitution cancelled');
    setPendingReEntry(null);
    setAvailableForSubstitution([]);
    setShowForcedSubModal(false);
  }, []);

  return {
    handlePlayerToggleRequest,
    ForcedSubstitutionModalComponent: () => (
      <ForcedSubstitutionModal
        isOpen={showForcedSubModal}
        onClose={handleModalClose}
        playerToReEnter={pendingReEntry}
        availableForSubstitution={availableForSubstitution}
        allPlayers={allPlayers}
        onConfirmSubstitution={handleForcedSubstitutionConfirm}
      />
    )
  };
};

export default ReEntryManager;
