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
}

const SubstitutionFlowManager = ({
  trackedPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedFixtureData,
  onAddPlayer,
  onSubstitutionComplete
}: SubstitutionFlowManagerProps) => {
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [pendingSubstitution, setPendingSubstitution] = useState<{
    id: number;
    name: string;
    team: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkForSubstitutions = () => {
      const activeCount = trackedPlayers.filter(p => p.isPlaying).length;
      
      // If we have less than 7 active players and there was a recent substitution
      if (activeCount < 7) {
        // Find the most recently stopped player
        const stoppedPlayers = trackedPlayers.filter(p => !p.isPlaying);
        if (stoppedPlayers.length > 0) {
          const lastStopped = stoppedPlayers[stoppedPlayers.length - 1];
          
          // Trigger substitution flow
          setPendingSubstitution({
            id: lastStopped.id,
            name: lastStopped.name,
            team: lastStopped.team
          });
          setShowSubstitutionModal(true);
        }
      }
    };

    checkForSubstitutions();
  }, [trackedPlayers]);

  const getAvailablePlayersForSubstitution = () => {
    if (!pendingSubstitution) return [];
    
    const teamPlayers = pendingSubstitution.team === (selectedFixtureData?.home_team?.name || 'Home')
      ? homeTeamPlayers || []
      : awayTeamPlayers || [];
    
    return teamPlayers.filter(player => 
      !trackedPlayers.some(tracked => tracked.id === player.id)
    );
  };

  const handleSubstitution = (incomingPlayer: ProcessedPlayer) => {
    console.log('🔄 SubstitutionFlowManager: Making substitution:', {
      outgoing: pendingSubstitution?.name,
      incoming: incomingPlayer.name
    });
    
    // Add the incoming player
    onAddPlayer(incomingPlayer);
    
    // Show enhanced substitution complete toast
    toast({
      title: "🔄 Substitution Complete",
      description: `${pendingSubstitution?.name} → ${incomingPlayer.name} (${incomingPlayer.team})`,
    });
    
    // Clean up
    setPendingSubstitution(null);
    setShowSubstitutionModal(false);
    
    // Notify parent component
    onSubstitutionComplete?.();
  };

  const handleSkipSubstitution = () => {
    // Remove the old warning message - substitution is optional
    // Players can continue with fewer than 7 if needed
    setPendingSubstitution(null);
    setShowSubstitutionModal(false);
  };

  return (
    <SubstitutionModal
      isOpen={showSubstitutionModal}
      onClose={handleSkipSubstitution}
      outgoingPlayer={pendingSubstitution}
      availablePlayers={getAvailablePlayersForSubstitution()}
      onSubstitute={handleSubstitution}
    />
  );
};

export default SubstitutionFlowManager;
