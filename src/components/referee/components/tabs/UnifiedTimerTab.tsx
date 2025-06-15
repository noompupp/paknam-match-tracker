
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import EnhancedPlayerTimeTracker from "../playerTimeTracker/EnhancedPlayerTimeTracker";
import UnifiedMatchTimer from "../UnifiedMatchTimer";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useTranslation } from "@/hooks/useTranslation";

interface UnifiedTimerTabProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
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

const UnifiedTimerTab = ({
  selectedFixtureData,
  homeScore,
  awayScore,
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
}: UnifiedTimerTabProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  // Calculate current phase for 7-a-side timer
  const HALF_DURATION = 25 * 60; // 25 minutes in seconds
  const currentPhase = matchTime <= HALF_DURATION ? 'first' : 
                       matchTime <= HALF_DURATION * 2 ? 'second' : 'overtime';

  return (
    <div className="space-y-6">
      {/* Unified Match Timer Section */}
      <UnifiedMatchTimer
        selectedFixtureData={selectedFixtureData}
        homeScore={homeScore}
        awayScore={awayScore}
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
            {t("referee.playerTimeTracking", "Player Time Tracking")}
          </div>
        </div>
      </div>

      {/* Player Time Tracking Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t("referee.playerTimeTracking", "Player Time Tracking")}</h3>
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

export default UnifiedTimerTab;
