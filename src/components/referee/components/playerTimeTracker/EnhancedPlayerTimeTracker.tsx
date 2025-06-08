
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { Users, Play, AlertTriangle, Lock, UserPlus } from "lucide-react";
import SevenASideValidationPanel from "../SevenASideValidationPanel";
import TrackedPlayersList from "./TrackedPlayersList";
import TimeTrackerHeader from "./TimeTrackerHeader";
import SubstitutionModal from "./SubstitutionModal";
import InitialPlayerSelection from "./InitialPlayerSelection";
import { 
  validatePlayerCount, 
  validateTeamLock, 
  canRemovePlayer, 
  canAddPlayer,
  getSubstitutionRequiredMessage 
} from "./playerValidationUtils";

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
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [pendingSubstitution, setPendingSubstitution] = useState<{
    id: number;
    name: string;
    team: string;
  } | null>(null);

  const playerCountValidation = validatePlayerCount(trackedPlayers);
  const teamLockValidation = validateTeamLock(trackedPlayers);
  const substitutionMessage = getSubstitutionRequiredMessage(playerCountValidation.activeCount);

  // Get available players for substitution (from the same team, not currently tracked)
  const getAvailablePlayersForSubstitution = () => {
    if (!pendingSubstitution) return [];
    
    const teamPlayers = pendingSubstitution.team === (selectedFixtureData?.home_team?.name || 'Home')
      ? homeTeamPlayers || []
      : awayTeamPlayers || [];
    
    return teamPlayers.filter(player => 
      !trackedPlayers.some(tracked => tracked.id === player.id)
    );
  };

  const handleStartMatch = (selectedPlayers: ProcessedPlayer[], team: 'home' | 'away') => {
    console.log('🚀 Starting match with initial squad:', {
      team,
      playerCount: selectedPlayers.length,
      players: selectedPlayers.map(p => p.name)
    });
    
    // Add all selected players to tracking
    selectedPlayers.forEach(player => {
      onAddPlayer(player);
    });
  };

  const handlePlayerRemove = (playerId: number) => {
    const removal = canRemovePlayer(playerId, trackedPlayers);
    
    if (!removal.canRemove) {
      console.warn('Cannot remove player:', removal.reason);
      return;
    }

    const player = trackedPlayers.find(p => p.id === playerId);
    if (player && player.isPlaying) {
      // Player is actively playing, trigger substitution modal
      setPendingSubstitution({
        id: player.id,
        name: player.name,
        team: player.team
      });
      setShowSubstitutionModal(true);
    }
    
    // Remove the player regardless
    onRemovePlayer(playerId);
  };

  const handleSubstitution = (incomingPlayer: ProcessedPlayer) => {
    console.log('🔄 Making substitution:', {
      outgoing: pendingSubstitution?.name,
      incoming: incomingPlayer.name
    });
    
    // Add the incoming player
    onAddPlayer(incomingPlayer);
    
    // Clear pending substitution
    setPendingSubstitution(null);
  };

  const handleQuickAdd = () => {
    if (trackedPlayers.length === 0) {
      // No players tracked yet, show initial selection
      setShowInitialSelection(true);
    } else {
      // Players already tracked, use manual addition (existing functionality)
      console.log('Use existing player selection dropdown');
    }
  };

  const isMatchStarted = trackedPlayers.length > 0;
  const hasActiveTracking = trackedPlayers.some(p => p.isPlaying);

  console.log('🎯 EnhancedPlayerTimeTracker Debug:', {
    trackedCount: trackedPlayers.length,
    activeCount: playerCountValidation.activeCount,
    isValid: playerCountValidation.isValid,
    teamLocked: teamLockValidation.isLocked,
    lockedTeam: teamLockValidation.lockedTeam
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

      {/* Player Count Status */}
      <Alert variant={playerCountValidation.severity === 'error' ? 'destructive' : 'default'}>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>{playerCountValidation.message}</span>
            <Badge variant={playerCountValidation.isValid ? 'default' : 'destructive'}>
              {playerCountValidation.activeCount}/7 on field
            </Badge>
          </div>
          {substitutionMessage && (
            <p className="text-sm mt-1 font-medium">{substitutionMessage}</p>
          )}
        </AlertDescription>
      </Alert>

      {/* Team Lock Status */}
      {teamLockValidation.isLocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{teamLockValidation.message}</span>
              <Badge variant="outline">Team Locked</Badge>
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
                Select Starting Squad (7 players)
              </Button>
            ) : (
              <Button
                onClick={handleQuickAdd}
                variant="outline"
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Player to Squad
              </Button>
            )}
          </div>

          {/* Tracked Players List */}
          <TrackedPlayersList
            trackedPlayers={trackedPlayers}
            allPlayers={allPlayers}
            formatTime={formatTime}
            onTogglePlayerTime={onTogglePlayerTime}
            onRemovePlayer={handlePlayerRemove}
          />

          {!isMatchStarted && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No squad selected</p>
              <p className="text-sm">Select 7 starting players to begin match tracking</p>
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

      {/* Substitution Modal */}
      <SubstitutionModal
        isOpen={showSubstitutionModal}
        onClose={() => {
          setShowSubstitutionModal(false);
          setPendingSubstitution(null);
        }}
        outgoingPlayer={pendingSubstitution}
        availablePlayers={getAvailablePlayersForSubstitution()}
        onSubstitute={handleSubstitution}
      />
    </div>
  );
};

export default EnhancedPlayerTimeTracker;
