
import { useState } from "react";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { PlayerTime } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { validateSubstitution } from "./substitutionValidationUtils";
import SubstitutionModal from "./SubstitutionModal";

interface SmartSubstitutionManagerProps {
  trackedPlayers: PlayerTime[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  selectedFixtureData?: any;
  onAddPlayer: (player: ProcessedPlayer) => void;
  onTogglePlayerTime: (playerId: number) => void;
}

const SmartSubstitutionManager = ({
  trackedPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedFixtureData,
  onAddPlayer,
  onTogglePlayerTime
}: SmartSubstitutionManagerProps) => {
  const [pendingAction, setPendingAction] = useState<{
    type: 'toggle' | 'add';
    playerId?: number;
    playerToAdd?: ProcessedPlayer;
    playerToRemove?: { id: number; name: string; team: string };
  } | null>(null);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const { toast } = useToast();

  const handlePlayerToggle = (playerId: number) => {
    const validation = validateSubstitution('toggle', playerId, trackedPlayers);
    
    console.log('🔄 SmartSubstitutionManager: Player toggle validation:', {
      playerId,
      validation,
      activeCount: trackedPlayers.filter(p => p.isPlaying).length
    });

    if (validation.actionType === 'direct') {
      // Direct action allowed
      onTogglePlayerTime(playerId);
      return;
    }

    if (validation.requiresSubstitution) {
      const player = trackedPlayers.find(p => p.id === playerId);
      if (player && player.isPlaying) {
        // Need to substitute this player out
        setPendingAction({
          type: 'toggle',
          playerId,
          playerToRemove: { id: player.id, name: player.name, team: player.team }
        });
        setShowSubstitutionModal(true);
        return;
      }
      
      if (player && !player.isPlaying) {
        // Field is full, need to substitute someone out first
        toast({
          title: "Substitution Required",
          description: "Field is full. Remove a player first to bring this player in.",
          variant: "destructive"
        });
        return;
      }
    }

    if (!validation.canSubOut || !validation.canSubIn) {
      toast({
        title: "Action Not Allowed",
        description: validation.reason || "Cannot perform this action",
        variant: "destructive"
      });
      return;
    }
  };

  const handlePlayerAdd = (player: ProcessedPlayer) => {
    const validation = validateSubstitution('in', -1, trackedPlayers, player);
    
    console.log('➕ SmartSubstitutionManager: Player add validation:', {
      player: player.name,
      validation,
      activeCount: trackedPlayers.filter(p => p.isPlaying).length
    });

    if (validation.actionType === 'direct') {
      // Direct addition allowed
      onAddPlayer(player);
      return;
    }

    if (validation.requiresSubstitution) {
      // Need to substitute someone out first
      setPendingAction({
        type: 'add',
        playerToAdd: player
      });
      setShowSubstitutionModal(true);
      return;
    }

    if (!validation.canSubIn) {
      toast({
        title: "Cannot Add Player",
        description: validation.reason || "Cannot add this player",
        variant: "destructive"
      });
      return;
    }
  };

  const getAvailablePlayersForSubstitution = () => {
    if (!pendingAction) return [];
    
    const teamPlayers = pendingAction.playerToRemove?.team === (selectedFixtureData?.home_team?.name || 'Home')
      ? homeTeamPlayers || []
      : awayTeamPlayers || [];
    
    return teamPlayers.filter(player => 
      !trackedPlayers.some(tracked => tracked.id === player.id)
    );
  };

  const handleSubstitution = (incomingPlayer: ProcessedPlayer) => {
    if (!pendingAction) return;

    console.log('🔄 SmartSubstitutionManager: Processing substitution:', {
      action: pendingAction.type,
      incoming: incomingPlayer.name,
      outgoing: pendingAction.playerToRemove?.name
    });

    if (pendingAction.type === 'toggle' && pendingAction.playerId) {
      // Complete the toggle action
      onTogglePlayerTime(pendingAction.playerId);
    }

    // Add the incoming player
    onAddPlayer(incomingPlayer);
    
    // Show success toast
    toast({
      title: "🔄 Substitution Complete",
      description: `${pendingAction.playerToRemove?.name || 'Player'} → ${incomingPlayer.name} (${incomingPlayer.team})`,
    });
    
    // Clean up
    setPendingAction(null);
    setShowSubstitutionModal(false);
  };

  const handleSkipSubstitution = () => {
    // Allow skip but show warning if needed
    const activeCount = trackedPlayers.filter(p => p.isPlaying).length;
    
    if (activeCount < 7) {
      toast({
        title: "Below Minimum Players",
        description: `Only ${activeCount} players on field. Consider adding a substitute.`,
        variant: "default"
      });
    }
    
    setPendingAction(null);
    setShowSubstitutionModal(false);
  };

  return {
    handlePlayerToggle,
    handlePlayerAdd,
    substitutionModal: (
      <SubstitutionModal
        isOpen={showSubstitutionModal}
        onClose={handleSkipSubstitution}
        outgoingPlayer={pendingAction?.playerToRemove || null}
        availablePlayers={getAvailablePlayersForSubstitution()}
        onSubstitute={handleSubstitution}
      />
    )
  };
};

export default SmartSubstitutionManager;
