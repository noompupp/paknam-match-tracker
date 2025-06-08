
import { useState, useEffect } from "react";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { PlayerTime } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { validateSubstitution } from "./substitutionValidationUtils";
import { getEnhancedAvailablePlayers } from "./reSubstitutionUtils";
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
    type: 'toggle' | 'add' | 'automatic' | 're-substitution';
    playerId?: number;
    playerToAdd?: ProcessedPlayer;
    playerToRemove?: { id: number; name: string; team: string };
    isReSubstitution?: boolean;
  } | null>(null);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const { toast } = useToast();

  // Monitor for automatic substitution triggers
  useEffect(() => {
    const activeCount = trackedPlayers.filter(p => p.isPlaying).length;
    
    console.log('🔄 SmartSubstitutionManager: Monitoring automatic substitution triggers:', {
      activeCount,
      trackedCount: trackedPlayers.length,
      pendingAction: pendingAction?.type
    });
    
    // If we have less than 7 active players and there was a recent substitution
    if (activeCount < 7 && !pendingAction) {
      // Find the most recently stopped player
      const stoppedPlayers = trackedPlayers.filter(p => !p.isPlaying);
      if (stoppedPlayers.length > 0) {
        const lastStopped = stoppedPlayers[stoppedPlayers.length - 1];
        
        console.log('🚨 SmartSubstitutionManager: Triggering automatic substitution for:', lastStopped.name);
        
        // Trigger substitution flow
        setPendingAction({
          type: 'automatic',
          playerToRemove: {
            id: lastStopped.id,
            name: lastStopped.name,
            team: lastStopped.team
          }
        });
        setShowSubstitutionModal(true);
      }
    }
  }, [trackedPlayers, pendingAction]);

  const handlePlayerToggle = (playerId: number) => {
    const validation = validateSubstitution('toggle', playerId, trackedPlayers);
    const player = trackedPlayers.find(p => p.id === playerId);
    
    console.log('🔄 SmartSubstitutionManager: Player toggle validation:', {
      playerId,
      playerName: player?.name,
      isPlaying: player?.isPlaying,
      validation,
      activeCount: trackedPlayers.filter(p => p.isPlaying).length
    });

    if (validation.actionType === 'direct') {
      // Direct action allowed
      if (validation.isReSubstitution) {
        toast({
          title: "🔄 Re-substitution Complete",
          description: `${player?.name} is back on the field`,
        });
      }
      onTogglePlayerTime(playerId);
      return;
    }

    if (validation.requiresSubstitution) {
      if (player && player.isPlaying) {
        // Need to substitute this player out
        setPendingAction({
          type: 'toggle',
          playerId,
          playerToRemove: { id: player.id, name: player.name, team: player.team },
          isReSubstitution: false
        });
        setShowSubstitutionModal(true);
        return;
      }
      
      if (player && !player.isPlaying && validation.isReSubstitution) {
        // This is a re-substitution that requires removing someone first
        console.log('🚨 Re-substitution enforcement triggered for:', player.name);
        
        setPendingAction({
          type: 're-substitution',
          playerId,
          playerToRemove: null, // Will be selected in modal
          isReSubstitution: true
        });
        setShowSubstitutionModal(true);
        
        toast({
          title: "Substitution Required",
          description: `Field is full. Remove a player first to bring ${player.name} back in.`,
          variant: "default"
        });
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

  const getEnhancedAvailablePlayersForSubstitution = () => {
    if (!pendingAction) return { newPlayers: [], reSubstitutionPlayers: [], canReSubstitute: false };
    
    // Determine team based on the action type
    let teamPlayers: ProcessedPlayer[] = [];
    
    if (pendingAction.playerToRemove?.team) {
      // Use the team of the player being removed
      teamPlayers = pendingAction.playerToRemove.team === (selectedFixtureData?.home_team?.name || 'Home')
        ? homeTeamPlayers || []
        : awayTeamPlayers || [];
    } else if (pendingAction.playerToAdd?.team) {
      // Use the team of the player being added
      teamPlayers = pendingAction.playerToAdd.team === (selectedFixtureData?.home_team?.name || 'Home')
        ? homeTeamPlayers || []
        : awayTeamPlayers || [];
    } else if (pendingAction.type === 're-substitution') {
      // For re-substitution, determine team from the player being re-substituted
      const reSubPlayer = trackedPlayers.find(p => p.id === pendingAction.playerId);
      if (reSubPlayer) {
        teamPlayers = reSubPlayer.team === (selectedFixtureData?.home_team?.name || 'Home')
          ? homeTeamPlayers || []
          : awayTeamPlayers || [];
      }
    } else {
      // Fallback: combine both teams
      teamPlayers = [...(homeTeamPlayers || []), ...(awayTeamPlayers || [])];
    }
    
    return getEnhancedAvailablePlayers(trackedPlayers, teamPlayers);
  };

  const handleSubstitution = (incomingPlayer: ProcessedPlayer) => {
    if (!pendingAction) return;

    console.log('🔄 SmartSubstitutionManager: Processing substitution:', {
      action: pendingAction.type,
      incoming: incomingPlayer.name,
      outgoing: pendingAction.playerToRemove?.name,
      isReSubstitution: pendingAction.isReSubstitution
    });

    if (pendingAction.type === 'toggle' && pendingAction.playerId) {
      // Complete the toggle action
      onTogglePlayerTime(pendingAction.playerId);
    } else if (pendingAction.type === 're-substitution' && pendingAction.playerId) {
      // Complete the re-substitution by toggling the original player back on
      onTogglePlayerTime(pendingAction.playerId);
    }

    // Add the incoming player (or re-activate if it's a re-substitution)
    const existingPlayer = trackedPlayers.find(p => p.id === incomingPlayer.id);
    if (existingPlayer && !existingPlayer.isPlaying) {
      // This is a re-substitution - toggle the existing player back on
      onTogglePlayerTime(incomingPlayer.id);
    } else {
      // This is a new player
      onAddPlayer(incomingPlayer);
    }
    
    // Show success toast with re-substitution indicator
    const isReSubstitution = trackedPlayers.some(p => p.id === incomingPlayer.id);
    const actionType = pendingAction.type === 'automatic' ? 'Automatic Substitution' : 
                      pendingAction.type === 're-substitution' ? 'Re-Substitution' : 'Substitution';
    
    toast({
      title: isReSubstitution ? `🔄 ${actionType} Complete` : `🔄 ${actionType} Complete`,
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

  const enhancedAvailablePlayers = getEnhancedAvailablePlayersForSubstitution();

  return {
    handlePlayerToggle,
    handlePlayerAdd,
    substitutionModal: (
      <SubstitutionModal
        isOpen={showSubstitutionModal}
        onClose={handleSkipSubstitution}
        outgoingPlayer={pendingAction?.playerToRemove || null}
        enhancedAvailablePlayers={enhancedAvailablePlayers}
        onSubstitute={handleSubstitution}
        actionType={pendingAction?.type || 'toggle'}
        isReSubstitution={pendingAction?.isReSubstitution || false}
      />
    )
  };
};

export default SmartSubstitutionManager;
