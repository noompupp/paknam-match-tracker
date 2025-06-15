import { Separator } from "@/components/ui/separator";
import { Users, Lock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedPlayerTimeTracker from "../playerTimeTracker/EnhancedPlayerTimeTracker";
import UnifiedMatchTimer from "../UnifiedMatchTimer";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useRoleBasedAccess } from "../../hooks/useRoleBasedAccess";

interface RoleBasedUnifiedTimerTabProps {
  selectedFixtureData: any;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  trackedPlayers: PlayerTime[];
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onAddPlayer: (player: ProcessedPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
}

const RoleBasedUnifiedTimerTab = ({
  selectedFixtureData,
  matchTime,
  isRunning,
  formatTime,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  trackedPlayers,
  onToggleTimer,
  onResetMatch,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime
}: RoleBasedUnifiedTimerTabProps) => {
  const isMobile = useIsMobile();
  const { canAccessTimerControls, isLoading } = useRoleBasedAccess(selectedFixtureData?.id);

  // Calculate current phase for 7-a-side timer
  const HALF_DURATION = 25 * 60; // 25 minutes in seconds
  const currentPhase = matchTime <= HALF_DURATION ? 'first' : 
                       matchTime <= HALF_DURATION * 2 ? 'second' : 'overtime';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <p>Loading access permissions...</p>
        </div>
      </div>
    );
  }

  if (!canAccessTimerControls) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Timer Access Restricted</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              You don't have permission to access timer functionality. This feature is only available to referees assigned to time tracking roles.
            </p>
            <div className="text-xs text-muted-foreground">
              Required role: Time Tracking or Time Tracking Responsibility
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unified Match Timer Section */}
      <UnifiedMatchTimer
        selectedFixtureData={selectedFixtureData}
        matchTime={matchTime}
        isRunning={isRunning}
        formatTime={formatTime}
        onToggleTimer={onToggleTimer}
        onResetMatch={onResetMatch}
        phase={currentPhase}
      />

      {/* Separator */}
      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background px-3 text-sm text-muted-foreground font-medium">
            Player Time Tracking
          </div>
        </div>
      </div>

      {/* Player Time Tracking Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Player Time Tracking</h3>
        </div>
        
        <EnhancedPlayerTimeTracker
          trackedPlayers={trackedPlayers}
          allPlayers={allPlayers}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onTogglePlayerTime={onTogglePlayerTime}
          formatTime={formatTime}
          matchTime={matchTime}
          selectedFixtureData={selectedFixtureData}
        />
      </div>
    </div>
  );
};

export default RoleBasedUnifiedTimerTab;
