
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { isSecondHalf, getCurrentHalfTime } from "@/utils/timeUtils";

interface PlayerStatusBadgeProps {
  role: string;
  totalTime: number;
  currentHalfTime?: number; // Optional - will calculate if not provided
  isPlaying: boolean;
  matchTime: number;
  className?: string;
  playerId?: number; // For debugging
  playerHalfTimes?: Map<number, { firstHalf: number; secondHalf: number }>; // For fallback
}

const PlayerStatusBadge = ({
  role,
  totalTime,
  currentHalfTime,
  isPlaying,
  matchTime,
  className,
  playerId,
  playerHalfTimes = new Map()
}: PlayerStatusBadgeProps) => {
  const { t, language } = useTranslation();
  
  // CRITICAL FIX: Calculate current half time directly if not provided
  const actualCurrentHalfTime = (() => {
    if (currentHalfTime !== undefined) {
      return currentHalfTime;
    }
    
    // Fallback 1: Try to get from playerHalfTimes map
    if (playerId && playerHalfTimes.has(playerId)) {
      const halfTimes = playerHalfTimes.get(playerId)!;
      return isSecondHalf(matchTime) ? halfTimes.secondHalf : halfTimes.firstHalf;
    }
    
    // Fallback 2: Calculate based on match progression (rough estimate)
    // This is a simplified calculation - in a real scenario, we'd need more context
    const halfDuration = 25 * 60; // 25 minutes per half
    if (isSecondHalf(matchTime)) {
      // For second half, estimate based on how much time they've been playing
      // This is approximate and should ideally be replaced with proper tracking
      return Math.min(totalTime, getCurrentHalfTime(matchTime));
    } else {
      // For first half, use total time (assuming they started at beginning)
      return Math.min(totalTime, matchTime);
    }
  })();
  
  const getStatusInfo = () => {
    const roleNormalized = role.toLowerCase();

    console.log('🎯 PlayerStatusBadge calculation (REAL-TIME FIXED):', {
      playerId,
      role,
      providedCurrentHalfTime: currentHalfTime,
      actualCurrentHalfTime,
      totalTime: `${Math.floor(totalTime / 60)}:${String(totalTime % 60).padStart(2, '0')}`,
      matchTime: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`,
      currentHalf: isSecondHalf(matchTime) ? 2 : 1,
      hasPlayerHalfTimes: playerHalfTimes.size > 0,
      isPlaying
    });

    // S-class players: 20 minutes per half limit (1200 seconds)
    if (roleNormalized === 's-class') {
      const limitSeconds = 20 * 60; // 20 minutes
      const warningThreshold = 18 * 60; // 18 minutes

      const currentHalfMin = Math.floor(actualCurrentHalfTime / 60);

      if (actualCurrentHalfTime >= limitSeconds) {
        return {
          label: t("referee.limit", "LIMIT EXCEEDED"),
          variant: "destructive" as const,
          icon: AlertTriangle,
          description: `${currentHalfMin}/20min`
        };
      }

      if (actualCurrentHalfTime >= warningThreshold) {
        return {
          label: t("referee.approachingLimit", "APPROACHING LIMIT"),
          variant: "secondary" as const,
          icon: Timer,
          description: `${currentHalfMin}/20min`
        };
      }

      return {
        label: t("referee.status.withinLimit", "WITHIN LIMIT"),
        variant: "default" as const,
        icon: CheckCircle,
        description: `${currentHalfMin}/20min`
      };
    }

    // Starter players: 10 minutes minimum total
    if (roleNormalized === 'starter') {
      const minTotal = 10 * 60; // 10 minutes
      const totalMin = Math.floor(totalTime / 60);
      const remainingMatchTime = (50 * 60) - matchTime; // 50 min total match

      if (totalTime >= minTotal) {
        return {
          label: t("referee.status.minMet", "MIN MET"),
          variant: "default" as const,
          icon: CheckCircle,
          description: `${totalMin}/10min`
        };
      }

      if (remainingMatchTime < 300 && totalTime < minTotal) { // 5 minutes remaining
        return {
          label: t("referee.status.needsTime", "NEEDS TIME"),
          variant: "secondary" as const,
          icon: AlertTriangle,
          description: `${totalMin}/10min`
        };
      }

      return {
        label: t("referee.status.inProgress", "IN PROGRESS"),
        variant: "outline" as const,
        icon: Clock,
        description: `${totalMin}/10min`
      };
    }

    // Captain players: no limits
    return {
      label: t("referee.status.noLimits", "NO LIMITS"),
      variant: "outline" as const,
      icon: CheckCircle,
      description: t("referee.status.unlimitedPlaytime", "Unlimited playtime")
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Badge variant={status.variant} className="text-xs px-2 py-0.5 h-5">
        <Icon className="h-3 w-3 mr-1" />
        {status.label}
      </Badge>
      <span className="text-xs text-muted-foreground text-center leading-none">
        {status.description}
      </span>
    </div>
  );
};

export default PlayerStatusBadge;
