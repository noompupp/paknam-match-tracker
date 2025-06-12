
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";
import { usePlayerStatsFormatting } from "@/hooks/useEnhancedTeamStats";

interface PlayerMinutesDisplayProps {
  player: EnhancedPlayerStats;
  variant?: 'default' | 'compact';
}

const PlayerMinutesDisplay = ({ player, variant = 'default' }: PlayerMinutesDisplayProps) => {
  const { formatMinutes } = usePlayerStatsFormatting();

  if (variant === 'compact') {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Clock className="h-3 w-3 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-sm text-foreground">
            {formatMinutes(player.total_minutes_played)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Minutes</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center gap-1 mb-1">
        <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="font-semibold text-foreground">
          {formatMinutes(player.total_minutes_played)}
        </span>
      </div>
      <div className="flex gap-1">
        <Badge variant="outline" className="text-xs">
          {player.minutesPerMatch}min/match
        </Badge>
      </div>
    </div>
  );
};

export default PlayerMinutesDisplay;
