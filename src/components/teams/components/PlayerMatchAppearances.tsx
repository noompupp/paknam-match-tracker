
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";

interface PlayerMatchAppearancesProps {
  player: EnhancedPlayerStats;
  variant?: 'default' | 'compact';
}

const PlayerMatchAppearances = ({ player, variant = 'default' }: PlayerMatchAppearancesProps) => {
  const appearances = player.matches_played;
  const efficiency = appearances > 0 ? 
    Math.round((player.goals + player.assists) / appearances * 100) / 100 : 0;

  if (variant === 'compact') {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-sm text-foreground">{appearances}</span>
        </div>
        <p className="text-xs text-muted-foreground">Apps</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center gap-1 mb-1">
        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-foreground">{appearances}</span>
      </div>
      <div className="flex gap-1">
        <Badge variant="outline" className="text-xs">
          {efficiency} G+A/game
        </Badge>
      </div>
    </div>
  );
};

export default PlayerMatchAppearances;
