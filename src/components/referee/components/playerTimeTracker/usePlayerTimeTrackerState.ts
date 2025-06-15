
import { useState } from "react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useToast } from "@/hooks/use-toast";
import { usePlayerTimeHandlers } from "../../hooks/handlers/usePlayerTimeHandlers";
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
  trackedPlayers,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime = 0,
  selectedFixtureData
}: UsePlayerTimeTrackerStateProps) => {
  const [showInitialSelection, setShowInitialSelection] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslation();

  // Adapter: convert PlayerTime to ProcessedPlayer for onAddPlayer
  const addPlayerAdapter = (player: PlayerTime, time: number) => {
    // Try to find the ProcessedPlayer by id
    const found = allPlayers.find(p => p.id === player.id);
    if (found) {
      return Promise.resolve(onAddPlayer(found));
    }
    // Fallback: Construct a minimal ProcessedPlayer
    const fallbackProcessedPlayer: ProcessedPlayer = {
      id: player.id,
      name: player.name,
      team: player.team,
      team_id: "",
      number: "",
      position: "Player",
      role: "Starter",
    };
    return Promise.resolve(onAddPlayer(fallbackProcessedPlayer));
  };

  const handlersProps = {
    selectedFixtureData,
    matchTime,
    playersForTimeTracker: trackedPlayers,
    addPlayer: addPlayerAdapter,
    removePlayer: onRemovePlayer,
    togglePlayerTime: async (playerId: number, time: number) => onTogglePlayerTime(playerId),
    addEvent: (type: string, description: string, time: number) => {
      console.log(`Event: ${type} - ${description} at ${time}`);
    }
  };

  const { 
    handleAddPlayer, 
    handleRemovePlayer, 
    handleTogglePlayerTime,
    substitutionManager 
  } = usePlayerTimeHandlers(handlersProps);

  const playerCountValidation = validatePlayerCount(trackedPlayers, t);
  const teamLockValidation = validateTeamLock(trackedPlayers, t);

  const handleStartMatch = (selectedPlayers: ProcessedPlayer[], team: 'home' | 'away') => {
    console.log('🚀 Starting match with initial squad:', {
      team,
      playerCount: selectedPlayers.length,
      players: selectedPlayers.map(p => p.name)
    });
    selectedPlayers.forEach(player => {
      onAddPlayer(player);
    });
  };

  const handlePlayerRemove = (playerId: number) => {
    const removal = canRemovePlayer(playerId, trackedPlayers, t);
    if (!removal.canRemove) {
      toast({
        title: t('referee.cannotRemovePlayer'),
        description: removal.reason
          ? t('referee.removePlayerReason').replace('{reason}', removal.reason)
          : "",
        variant: "destructive"
      });
      return;
    }
    handleRemovePlayer(playerId);
  };

  const isMatchStarted = trackedPlayers.length > 0;

  return {
    showInitialSelection,
    setShowInitialSelection,
    handleStartMatch,
    handlePlayerRemove,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    playerCountValidation,
    teamLockValidation,
    substitutionManager,
    t,
    language,
    trackedPlayers,
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    onTogglePlayerTime,
    formatTime,
    matchTime,
    selectedFixtureData,
    isMatchStarted,
  };
};
