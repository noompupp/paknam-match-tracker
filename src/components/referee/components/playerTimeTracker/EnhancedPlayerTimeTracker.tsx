
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { Users, Play, AlertTriangle, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

  const playerCountValidation = validatePlayerCount(trackedPlayers);
  const teamLockValidation = validateTeamLock(trackedPlayers);

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
      // Show toast notification instead of inline warning
      toast({
        title: "Cannot Remove Player",
        description: removal.reason,
        variant: "destructive"
      });
      return;
    }
    
    // Remove the player - substitution flow will be handled automatically
    onRemovePlayer(playerId);
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

      {/* Single Top-Level Player Count Alert (replaces repetitive warnings) */}
      {!playerCountValidation.isValid && (
        <Alert variant={playerCountValidation.severity === 'error' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{playerCountValidation.message}</span>
              <Badge variant={playerCountValidation.isValid ? 'default' : 'destructive'}>
                {playerCountValidation.activeCount}/7 on field
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

          {/* Tracked Players List with enhanced status badges */}
          <TrackedPlayersList
            trackedPlayers={trackedPlayers}
            allPlayers={allPlayers}
            formatTime={formatTime}
            onTogglePlayerTime={onTogglePlayerTime}
            onRemovePlayer={handlePlayerRemove}
            matchTime={matchTime}
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

      {/* Automatic Substitution Flow Manager */}
      <SubstitutionFlowManager
        trackedPlayers={trackedPlayers}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        selectedFixtureData={selectedFixtureData}
        onAddPlayer={onAddPlayer}
        onSubstitutionComplete={() => {
          console.log('✅ Substitution completed successfully');
        }}
      />
    </div>
  );
};

export default EnhancedPlayerTimeTracker;
