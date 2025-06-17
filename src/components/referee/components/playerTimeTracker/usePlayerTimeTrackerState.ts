
import { useState } from "react";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useToast } from "@/hooks/use-toast";
import { useSubstitutionManager } from "@/hooks/playerTracking/substitutionManager";
import { 
  validatePlayerCount, 
  validateTeamLock, 
  canRemovePlayer 
} from "./playerValidationUtils";
import { useTranslation } from "@/hooks/useTranslation";

export interface UsePlayerTimeTrackerStateProps {
  trackedPlayers: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  onAddPlayer: (player: ProcessedPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime?: number;
  selectedFixtureData?: any;
}

export const usePlayerTimeTrackerState = ({
  trackedPlayers: externalTrackedPlayers,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  onAddPlayer: externalOnAddPlayer,
  onRemovePlayer: externalOnRemovePlayer,
  onTogglePlayerTime: externalOnTogglePlayerTime,
  formatTime,
  matchTime = 0,
  selectedFixtureData
}: UsePlayerTimeTrackerStateProps) => {
  const [showInitialSelection, setShowInitialSelection] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const substitutionManager = useSubstitutionManager();

  // SIMPLIFIED ARCHITECTURE: Use external tracked players directly
  // This ensures the modal selections properly flow through the system
  const effectiveTrackedPlayers = externalTrackedPlayers;

  console.log('🎯 usePlayerTimeTrackerState Debug (Simplified):', {
    trackedCount: effectiveTrackedPlayers.length,
    allPlayersCount: allPlayers.length,
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    showInitialSelection
  });

  const handleAddPlayer = async (player: ProcessedPlayer) => {
    console.log('🔄 usePlayerTimeTrackerState: Adding player:', player);
    
    try {
      // Use external handler directly for proper integration
      externalOnAddPlayer(player);
      
      toast({
        title: t("referee.playerAdded", "Player Added"),
        description: t("referee.playerAddedDesc", `${player.name} added to tracking`),
      });
      
      console.log('✅ usePlayerTimeTrackerState: Player added successfully');
    } catch (error) {
      console.error('❌ usePlayerTimeTrackerState: Failed to add player:', error);
      toast({
        title: t("referee.error", "Error"),
        description: t("referee.addPlayerFailed", "Failed to add player"),
        variant: "destructive"
      });
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    console.log('🗑️ usePlayerTimeTrackerState: Removing player:', playerId);
    
    const removal = canRemovePlayer(playerId, effectiveTrackedPlayers, t);
    if (!removal.canRemove) {
      toast({
        title: t('referee.cannotRemovePlayer', 'Cannot Remove Player'),
        description: removal.reason || t('referee.removePlayerReason', 'Unable to remove player at this time'),
        variant: "destructive"
      });
      return;
    }
    
    externalOnRemovePlayer(playerId);
    
    toast({
      title: t("referee.playerRemoved", "Player Removed"),
      description: t("referee.playerRemovedDesc", "Player removed from tracking"),
    });
  };

  const handleTogglePlayerTime = async (playerId: number) => {
    console.log('⏯️ usePlayerTimeTrackerState: Toggling player time:', playerId);
    
    try {
      externalOnTogglePlayerTime(playerId);
      
      const player = effectiveTrackedPlayers.find(p => p.id === playerId);
      if (player) {
        const action = player.isPlaying ? "stopped" : "started";
        toast({
          title: t("referee.timeUpdated", "Time Updated"),
          description: t("referee.timeUpdatedDesc", `Player time ${action}`),
        });
      }
    } catch (error) {
      console.error('❌ usePlayerTimeTrackerState: Failed to toggle player time:', error);
      toast({
        title: t("referee.error", "Error"),
        description: t("referee.toggleTimeFailed", "Failed to toggle player time"),
        variant: "destructive"
      });
    }
  };

  const handleStartMatch = (selectedPlayers: ProcessedPlayer[], team: 'home' | 'away') => {
    console.log('🚀 usePlayerTimeTrackerState: Starting match with squad:', {
      team,
      playerCount: selectedPlayers.length,
      players: selectedPlayers.map(p => p.name)
    });
    
    // Add all selected players to tracking
    selectedPlayers.forEach(player => {
      handleAddPlayer(player);
    });
    
    toast({
      title: t("referee.matchStarted", "Match Started"),
      description: t("referee.matchStartedDesc", `Started tracking ${selectedPlayers.length} players`),
    });
  };

  const handleUndoSubOut = async (playerId: number) => {
    console.log('↩️ usePlayerTimeTrackerState: Undoing sub out:', playerId);
    await handleTogglePlayerTime(playerId);
  };

  const playerCountValidation = validatePlayerCount(effectiveTrackedPlayers, t);
  const teamLockValidation = validateTeamLock(effectiveTrackedPlayers, t);
  const isMatchStarted = effectiveTrackedPlayers.length > 0;

  return {
    showInitialSelection,
    setShowInitialSelection,
    handleStartMatch,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    handleUndoSubOut,
    playerCountValidation,
    teamLockValidation,
    substitutionManager,
    t,
    language,
    trackedPlayers: effectiveTrackedPlayers,
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    onTogglePlayerTime: handleTogglePlayerTime,
    formatTime,
    matchTime,
    selectedFixtureData,
    isMatchStarted,
  };
};
