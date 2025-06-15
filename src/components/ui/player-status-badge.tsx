import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface PlayerStatusBadgeProps {
  role: string;
  totalTime: number;
  currentHalfTime: number;
  isPlaying: boolean;
  matchTime: number;
  className?: string;
}

const PlayerStatusBadge = ({
  role,
  totalTime,
  currentHalfTime,
  isPlaying,
  matchTime,
  className
}: PlayerStatusBadgeProps) => {
  const { t, language } = useTranslation();
  const getStatusInfo = () => {
    const roleNormalized = role.toLowerCase();

    // S-class players: 20 minutes per half limit
    if (roleNormalized === 's-class') {
      const limitSeconds = 20 * 60; // 20 minutes
      const warningThreshold = 18 * 60; // 18 minutes

      const currentHalfMin = Math.floor(currentHalfTime / 60);

      if (currentHalfTime >= limitSeconds) {
        return {
          label: t("referee.limit", t("referee.limit")), // fallback for history
          variant: "destructive" as const,
          icon: AlertTriangle,
          description: `20/20min`
        };
      }

      if (currentHalfTime >= warningThreshold) {
        return {
          label: t("referee.approachingLimit", t("referee.status.inProgress")),
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

    // Captain players: no limits (show "Unlimited playtime" from translation)
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
