
import { Trophy, Target, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";
import { usePlayerStatsFormatting } from "@/hooks/useEnhancedTeamStats";

interface PlayerStatsIconsProps {
  player: EnhancedPlayerStats;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const PlayerStatsIcons = ({ player, size = 'md', showLabels = false }: PlayerStatsIconsProps) => {
  const { formatStat } = usePlayerStatsFormatting();

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const containerClasses = {
    sm: "gap-1 sm:gap-2",
    md: "gap-2 sm:gap-3",
    lg: "gap-3 sm:gap-4"
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const statItems = [
    {
      icon: Trophy,
      value: player.goals,
      label: "G",
      color: "text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: Target,
      value: player.assists,
      label: "A", 
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Clock,
      value: player.matches_played,
      label: "M",
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: Zap,
      value: player.contributionScore,
      label: "CS",
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className={cn("flex items-center text-muted-foreground flex-shrink-0", containerClasses[size])}>
      {statItems.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <stat.icon className={cn(sizeClasses[size], stat.color)} />
            <span className={cn("font-semibold text-foreground", textClasses[size])}>
              {formatStat(stat.value)}
            </span>
          </div>
          {showLabels && (
            <p className={cn("text-muted-foreground", size === 'sm' ? 'text-[10px]' : 'text-xs')}>
              {stat.label}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerStatsIcons;
