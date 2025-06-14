
import { Trophy, Target, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";
import { usePlayerStatsFormatting } from "@/hooks/useEnhancedTeamStats";

interface PlayerStatsBarProps {
  player: EnhancedPlayerStats;
  className?: string;
  size?: "compact" | "full";
}

const iconSize = {
  compact: "h-4 w-4",
  full: "h-5 w-5"
};

const textSize = {
  compact: "text-xs",
  full: "text-sm"
};

const PlayerStatsBar = ({
  player,
  className = "",
  size = "compact"
}: PlayerStatsBarProps) => {
  const { formatStat } = usePlayerStatsFormatting();

  // Responsive spacing for compact mode (horizontal and wrapping)
  return (
    <div
      className={cn(
        "flex flex-row flex-wrap items-center justify-start gap-3 mt-1 w-full",
        size === "compact"
          ? "sm:gap-4 gap-3"
          : "md:gap-6 gap-4",
        className
      )}
    >
      <div className="flex flex-col items-center min-w-[44px]">
        <Trophy className={cn(iconSize[size], "text-yellow-600")} />
        <span className={cn("font-semibold text-foreground leading-tight", textSize[size])}>
          {formatStat(player.goals)}
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight">G</span>
      </div>
      <div className="flex flex-col items-center min-w-[44px]">
        <Target className={cn(iconSize[size], "text-blue-600")} />
        <span className={cn("font-semibold text-foreground leading-tight", textSize[size])}>
          {formatStat(player.assists)}
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight">A</span>
      </div>
      <div className="flex flex-col items-center min-w-[44px]">
        <Clock className={cn(iconSize[size], "text-green-600")} />
        <span className={cn("font-semibold text-foreground leading-tight", textSize[size])}>
          {formatStat(player.matches_played)}
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight">M</span>
      </div>
      <div className="flex flex-col items-center min-w-[44px]">
        <Zap className={cn(iconSize[size], "text-purple-600")} />
        <span className={cn("font-semibold text-foreground leading-tight", textSize[size])}>
          {formatStat(player.contributionScore)}
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight">★</span>
      </div>
    </div>
  );
};

export default PlayerStatsBar;

