
import { useState, useEffect } from "react";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { PlayerTime } from "@/types/database";
import SubstitutionModal from "./SubstitutionModal";
import { useToast } from "@/hooks/use-toast";

interface SubstitutionFlowManagerProps {
  trackedPlayers: PlayerTime[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  selectedFixtureData?: any;
  onAddPlayer: (player: ProcessedPlayer) => void;
  onSubstitutionComplete?: () => void;
  substitutionManager?: {
    pendingSubstitution: any;
    hasPendingSubstitution: boolean;
    isSubOutInitiated: boolean;
    cancelPendingSubstitution: () => void;
  };
}

const SubstitutionFlowManager = ({
  trackedPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedFixtureData,
  onAddPlayer,
  onSubstitutionComplete,
  substitutionManager
}: SubstitutionFlowManagerProps) => {
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const { toast } = useToast();

  // Watch for "Sub Out" first scenarios (modal flow)
  useEffect(() => {
    if (substitutionManager?.hasPendingSubstitution && substitutionManager?.isSubOutInitiated) {
      // This is a "Sub Out" first scenario - show the modal
      setShowSubstitutionModal(true);
    } else {
      // Hide modal for "Sub In" first scenarios (streamlined flow)
      setShowSubstitutionModal(false);
    }
  }, [substitutionManager?.hasPendingSubstitution, substitutionManager?.isSubOutInitiated]);

  const getAvailablePlayersForSubstitution = () => {
    if (!substitutionManager?.pendingSubstitution) return [];
    
    // Find the substituted player to determine their team
    const substitutedPlayer = trackedPlayers.find(p => p.id === substitutionManager.pendingSubstitution.outgoingPlayerId);
    if (!substitutedPlayer) return [];
    
    const teamPlayers = substitutedPlayer.team === (selectedFixtureData?.home_team?.name || 'Home')
      ? homeTeamPlayers || []
      : awayTeamPlayers || [];
    
    return teamPlayers.filter(player => 
      !trackedPlayers.some(tracked => tracked.id === player.id)
    );
  };

  const handleSubstitution = (incomingPlayer: ProcessedPlayer) => {
    console.log('🔄 SubstitutionFlowManager: Making modal-based substitution:', {
      outgoing: substitutionManager?.pendingSubstitution?.outgoingPlayerName,
      incoming: incomingPlayer.name
    });
    
    // Add the incoming player
    onAddPlayer(incomingPlayer);
    
    // Show enhanced substitution complete toast
    toast({
      title: "🔄 Substitution Complete",
      description: `${substitutionManager?.pendingSubstitution?.outgoingPlayerName} → ${incomingPlayer.name} (${incomingPlayer.team})`,
    });
    
    // Clean up
    substitutionManager?.cancelPendingSubstitution();
    setShowSubstitutionModal(false);
    
    // Notify parent component
    onSubstitutionComplete?.();
  };

  const handleSkipSubstitution = () => {
    console.log('⏭️ SubstitutionFlowManager: Skipping substitution for:', substitutionManager?.pendingSubstitution?.outgoingPlayerName);
    
    // Clean up pending substitution
    substitutionManager?.cancelPendingSubstitution();
    setShowSubstitutionModal(false);
    
    toast({
      title: "Substitution Cancelled",
      description: "Continuing with current squad",
    });
  };

  // Only show modal for "Sub Out" first scenarios
  if (!substitutionManager?.isSubOutInitiated) {
    return null;
  }

  return (
    <SubstitutionModal
      isOpen={showSubstitutionModal}
      onClose={handleSkipSubstitution}
      outgoingPlayer={substitutionManager.pendingSubstitution ? {
        id: substitutionManager.pendingSubstitution.outgoingPlayerId,
        name: substitutionManager.pendingSubstitution.outgoingPlayerName,
        team: trackedPlayers.find(p => p.id === substitutionManager.pendingSubstitution.outgoingPlayerId)?.team || ''
      } : null}
      availablePlayers={getAvailablePlayersForSubstitution()}
      onSubstitute={handleSubstitution}
    />
  );
};

export default SubstitutionFlowManager;
