import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft } from "lucide-react";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import PlayerStatusBadge from "@/components/ui/player-status-badge";
import { canRemovePlayer } from "./playerValidationUtils";
import { isSecondHalf, getCurrentHalfTime } from "@/utils/timeUtils";
import { useTranslation } from "@/hooks/useTranslation";

interface TrackedPlayerCardProps {
  player: PlayerTime;
  playerInfo?: ProcessedPlayer;
  formatTime: (seconds: number) => string;
  onTogglePlayerTime: (playerId: number) => void;
  trackedPlayers?: PlayerTime[];
  matchTime?: number;
  isPendingSubstitution?: boolean;
  substitutionManager?: {
    pendingSubstitution: any;
    hasPendingSubstitution: boolean;
    isSubOutInitiated: boolean;
  };
  playerHalfTimes?: Map<number, { firstHalf: number; secondHalf: number }>;
}

const TrackedPlayerCard = ({
  player,
  playerInfo,
  formatTime,
  onTogglePlayerTime,
  trackedPlayers = [],
  matchTime = 0,
  isPendingSubstitution = false,
  substitutionManager,
  playerHalfTimes = new Map()
}: TrackedPlayerCardProps) => {
  const { t } = useTranslation();
  const role = playerInfo?.role || 'Starter';

  // Check if player can be removed
  const removal = canRemovePlayer(player.id, trackedPlayers);

  // CRITICAL FIX: Calculate current half time directly instead of relying on stale data
  const calculateCurrentHalfTime = () => {
    // Try to get from playerHalfTimes map first (most accurate)
    if (playerHalfTimes.has(player.id)) {
      const halfTimes = playerHalfTimes.get(player.id)!;
      const currentHalfTime = isSecondHalf(matchTime) ? halfTimes.secondHalf : halfTimes.firstHalf;
      
      console.log('📊 TrackedPlayerCard - Using playerHalfTimes data (FIXED):', {
        playerId: player.id,
        playerName: player.name,
        currentHalf: isSecondHalf(matchTime) ? 2 : 1,
        firstHalf: halfTimes.firstHalf,
        secondHalf: halfTimes.secondHalf,
        calculatedCurrentHalfTime: currentHalfTime,
        matchTime,
        halfTimesMapSize: playerHalfTimes.size
      });
      
      return currentHalfTime;
    }
    
    // Fallback: Calculate based on match progression
    const halfDuration = 25 * 60; // 25 minutes per half
    const currentHalfMatchTime = getCurrentHalfTime(matchTime);
    
    // Estimate current half time based on total playtime and match progression
    if (isSecondHalf(matchTime)) {
      // For second half, we need to estimate how much they've played in this half
      // This is a rough estimate - ideally we'd track this more precisely
      const estimatedSecondHalfTime = Math.min(player.totalTime, currentHalfMatchTime);
      
      console.log('📊 TrackedPlayerCard - Using fallback calculation (second half):', {
        playerId: player.id,
        playerName: player.name,
        totalTime: player.totalTime,
        currentHalfMatchTime,
        estimatedSecondHalfTime,
        matchTime
      });
      
      return estimatedSecondHalfTime;
    } else {
      // For first half, use total time (assuming they started at beginning)
      const estimatedFirstHalfTime = Math.min(player.totalTime, matchTime);
      
      console.log('📊 TrackedPlayerCard - Using fallback calculation (first half):', {
        playerId: player.id,
        playerName: player.name,
        totalTime: player.totalTime,
        matchTime,
        estimatedFirstHalfTime
      });
      
      return estimatedFirstHalfTime;
    }
  };

  const currentHalfTime = calculateCurrentHalfTime();

  // Check if this is a player who has played before (potential substitution candidate)
  const hasPlayedBefore = player.totalTime > 0;
  const isSubstitutionCandidate = hasPlayedBefore;

  // Check if there's a pending streamlined substitution that this player can complete
  const canCompleteStreamlinedSub = substitutionManager?.hasPendingSubstitution && 
                                   !substitutionManager?.isSubOutInitiated && 
                                   player.isPlaying && 
                                   player.id !== substitutionManager?.pendingSubstitution?.outgoingPlayerId;

  // DEBUGGING: Enhanced logging with FIXED timer information
  console.log('🎴 TrackedPlayerCard - Rendering with FIXED REAL-TIME timer debugging:', {
    playerId: player.id,
    name: player.name,
    role,
    isPlaying: player.isPlaying,
    totalTime: player.totalTime,
    totalTimeFormatted: formatTime(player.totalTime),
    matchTime,
    matchTimeFormatted: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`,
    currentHalf: isSecondHalf(matchTime) ? 2 : 1,
    currentHalfTime,
    currentHalfTimeFormatted: formatTime(currentHalfTime),
    hasPlayerHalfTimesData: playerHalfTimes.has(player.id),
    playerHalfTimesMapSize: playerHalfTimes.size,
    hasPlayedBefore,
    canRemove: removal.canRemove
  });

  // Determine button text and styling based on dual-behavior logic
  const getButtonProps = () => {
    if (isPendingSubstitution) {
      if (substitutionManager?.isSubOutInitiated) {
        return {
          text: t("referee.action.subOut", "Substituted Out"),
          variant: "outline" as const,
          icon: <ArrowRightLeft className="h-3 w-3" />
        };
      } else {
        return {
          text: t("referee.action.subIn", "Pending Sub In"),
          variant: "outline" as const,
          icon: <ArrowRightLeft className="h-3 w-3" />
        };
      }
    }

    // Show completion indicator for streamlined substitutions
    if (canCompleteStreamlinedSub) {
      return {
        text: t("referee.action.completeSub", "Complete Sub"),
        variant: "destructive" as const,
        icon: <ArrowRightLeft className="h-3 w-3" />
      };
    }

    // Show substitution buttons for players who have played before
    if (isSubstitutionCandidate) {
      if (player.isPlaying) {
        return {
          text: t("referee.action.subOut", "Sub Out"),
          variant: "destructive" as const,
          icon: <ArrowRightLeft className="h-3 w-3" />
        };
      } else {
        return {
          text: t("referee.action.subIn", "Sub In"),
          variant: "default" as const,
          icon: <ArrowRightLeft className="h-3 w-3" />
        };
      }
    }

    // For new players (no previous time), show Start/Stop
    if (player.isPlaying) {
      return {
        text: t("referee.action.stop", "Stop"),
        variant: "destructive" as const,
        icon: null
      };
    } else {
      return {
        text: t("referee.action.start", "Start"),
        variant: "default" as const,
        icon: null
      };
    }
  };

  const buttonProps = getButtonProps();

  // Apply reduced opacity & muted bg to inactive players
  const isActive = player.isPlaying;

  // DEBUGGING: Enhanced click handler with logging
  const handleToggleClick = () => {
    console.log('🖱️ TrackedPlayerCard - Button clicked with FIXED debugging:', {
      playerId: player.id,
      playerName: player.name,
      currentIsPlaying: player.isPlaying,
      matchTime,
      buttonAction: buttonProps.text,
      currentHalfTime,
      totalTime: player.totalTime
    });
    
    onTogglePlayerTime(player.id);
  };

  return (
    <div
      className={`p-2 sm:p-3 rounded-md border bg-card hover:shadow-sm transition-all
        ${isPendingSubstitution ? 'border-orange-300 bg-orange-50/50' : ''}
        ${canCompleteStreamlinedSub ? 'border-green-300 bg-green-50/50' : ''}
        ${!isActive && !isPendingSubstitution && !canCompleteStreamlinedSub ? 'opacity-40 bg-muted/60' : 'opacity-100'}
      `}
      tabIndex={0}
      aria-label={
        isActive
          ? `${player.name} is currently playing`
          : `${player.name} is not on the field`
      }
    >
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Compact player number */}
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {playerInfo?.number || '?'}
        </div>

        {/* Player info - optimized for space */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-medium text-sm truncate">{player.name}</span>
            <PlayerRoleBadge role={role} size="sm" />
            {isPendingSubstitution && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-orange-300 text-orange-700">
                {substitutionManager?.isSubOutInitiated ? t("referee.action.subOut", "Out") : t("referee.action.subIn", "Pending In")}
              </Badge>
            )}
            {canCompleteStreamlinedSub && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-green-300 text-green-700">
                {t("referee.action.completeSub", "Complete Sub")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground truncate">{player.team}</span>
            <Badge 
              variant={player.isPlaying ? "default" : "secondary"} 
              className="text-xs px-1.5 py-0 h-4"
            >
              {player.isPlaying ? "ON" : "OFF"}
            </Badge>
          </div>
        </div>

        {/* Timer and Status Display */}
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <div className="font-mono text-sm sm:text-base font-bold leading-tight">
            {formatTime(player.totalTime)}
          </div>
          
          {/* CRITICAL FIX: Pass the calculated currentHalfTime and playerId for debugging */}
          <PlayerStatusBadge
            role={role}
            totalTime={player.totalTime}
            currentHalfTime={currentHalfTime}
            isPlaying={player.isPlaying}
            matchTime={matchTime}
            playerId={player.id}
            playerHalfTimes={playerHalfTimes}
            className="hidden sm:flex"
          />
        </div>

        {/* Compact action buttons - FIXED: Use enhanced click handler */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant={buttonProps.variant}
            onClick={handleToggleClick}
            className={`h-7 px-2 text-xs ${canCompleteStreamlinedSub ? 'animate-pulse' : ''}`}
            disabled={isPendingSubstitution && substitutionManager?.isSubOutInitiated}
          >
            {buttonProps.icon && (
              <span className="sm:hidden mr-1">
                {buttonProps.icon}
              </span>
            )}
            <span className="hidden sm:inline">
              {buttonProps.text}
            </span>
            <span className="sm:hidden">
              {buttonProps.text.split(' ')[0]}
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile-only status display - FIXED: Pass the calculated currentHalfTime and playerId */}
      <div className="sm:hidden mt-2">
        <PlayerStatusBadge
          role={role}
          totalTime={player.totalTime}
          currentHalfTime={currentHalfTime}
          isPlaying={player.isPlaying}
          matchTime={matchTime}
          playerId={player.id}
          playerHalfTimes={playerHalfTimes}
        />
      </div>
    </div>
  );
};

export default TrackedPlayerCard;
