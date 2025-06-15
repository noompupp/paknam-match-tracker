import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { Users, Play, AlertTriangle, Lock, UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlayerTimeHandlers } from "../../hooks/handlers/usePlayerTimeHandlers";
import SevenASideValidationPanel from "../SevenASideValidationPanel";
import TrackedPlayersList from "./TrackedPlayersList";
import TimeTrackerHeader from "./TimeTrackerHeader";
import InitialPlayerSelection from "./InitialPlayerSelection";
import SubstitutionFlowManager from "./SubstitutionFlowManager";
import { 
  validatePlayerCount, 
  validateTeamLock, 
  canRemovePlayer
} from "./playerValidationUtils";
import { useTranslation } from "@/hooks/useTranslation";

interface EnhancedPlayerTimeTrackerProps {
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

const EnhancedPlayerTimeTracker = ({
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
}: EnhancedPlayerTimeTrackerProps) => {
  const [showInitialSelection, setShowInitialSelection] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslation();

  // Mock the handlers props structure for usePlayerTimeHandlers
  const handlersProps = {
    selectedFixtureData,
    matchTime,
    playersForTimeTracker: trackedPlayers,
    addPlayer: async (player: ProcessedPlayer, time: number) => onAddPlayer(player),
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

  // REMOVED: handleQuickAdd

  const isMatchStarted = trackedPlayers.length > 0;

  console.log('🎯 EnhancedPlayerTimeTracker Debug (Dual-Behavior):', {
    trackedCount: trackedPlayers.length,
    activeCount: playerCountValidation.activeCount,
    isValid: playerCountValidation.isValid,
    teamLocked: teamLockValidation.isLocked,
    lockedTeam: teamLockValidation.lockedTeam,
    pendingSubstitution: substitutionManager.pendingSubstitution,
    substitutionType: substitutionManager.isSubOutInitiated ? 'modal' : 'streamlined'
  });

  return (
    <div className="space-y-4">
      {/* Enhanced 7-a-Side Validation Panel */}
      <SevenASideValidationPanel
        trackedPlayers={trackedPlayers}
        allPlayers={allPlayers}
        matchTime={matchTime}
        formatTime={formatTime}
      />

      {/* Dual-Behavior Pending Substitution Alert */}
      {substitutionManager.hasPendingSubstitution && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {substitutionManager.isSubOutInitiated
                  ? t("referee.substitutionAlertOut").replace(
                      "{name}",
                      substitutionManager.pendingSubstitution?.outgoingPlayerName || ""
                    )
                  : t("referee.substitutionAlertIn").replace(
                      "{name}",
                      substitutionManager.pendingSubstitution?.outgoingPlayerName || ""
                    )
                }
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={substitutionManager.cancelPendingSubstitution}
                className="ml-2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Player Count Alert */}
      {!playerCountValidation.isValid && (
        <Alert variant={playerCountValidation.severity === 'error' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{playerCountValidation.message}</span>
              <Badge variant={playerCountValidation.isValid ? 'default' : 'destructive'}>
                {t("referee.playerOnFieldBadge").replace(
                  "{count}",
                  `${playerCountValidation.activeCount}`
                )}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Team Lock Status */}
      {teamLockValidation.isLocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{teamLockValidation.message}</span>
              <Badge variant="outline">{t("referee.teamLockedBadge")}</Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="card-shadow-lg">
        <TimeTrackerHeader 
          matchTime={matchTime}
          formatTime={formatTime}
        />
        
        <CardContent className="space-y-3 p-3 sm:p-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            {!isMatchStarted ? (
              <Button
                onClick={() => setShowInitialSelection(true)}
                className="flex-1"
                disabled={!selectedFixtureData}
              >
                <Play className="h-4 w-4 mr-2" />
                {t("referee.selectStartingSquadBtn")}
              </Button>
            ) : null}
          </div>

          {/* Tracked Players List */}
          <TrackedPlayersList
            trackedPlayers={trackedPlayers}
            allPlayers={allPlayers}
            formatTime={formatTime}
            onTogglePlayerTime={handleTogglePlayerTime}
            matchTime={matchTime}
            pendingSubstitutionPlayerId={substitutionManager.pendingSubstitution?.outgoingPlayerId || null}
            substitutionManager={substitutionManager}
          />

          {!isMatchStarted && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">{t("referee.noSquadSelectedHeader")}</p>
              <p className="text-sm">{t("referee.noSquadSelectedDesc")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Initial Player Selection Modal */}
      <InitialPlayerSelection
        isOpen={showInitialSelection}
        onClose={() => setShowInitialSelection(false)}
        homeTeamPlayers={homeTeamPlayers || []}
        awayTeamPlayers={awayTeamPlayers || []}
        onStartMatch={handleStartMatch}
        selectedFixtureData={selectedFixtureData}
      />

      {/* Dual-Behavior Substitution Flow Manager */}
      <SubstitutionFlowManager
        trackedPlayers={trackedPlayers}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        selectedFixtureData={selectedFixtureData}
        onAddPlayer={handleAddPlayer}
        onSubstitutionComplete={() => {
          console.log('✅ Dual-behavior substitution completed successfully');
        }}
        substitutionManager={substitutionManager}
      />
    </div>
  );
};

export default EnhancedPlayerTimeTracker;

// NOTE: This file is getting quite long (250+ lines). For maintainability,
// consider splitting it into smaller components after this change.
