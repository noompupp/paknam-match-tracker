
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";
import { usePlayerStatsFormatting } from "@/hooks/useEnhancedTeamStats";
import PlayerStatsIcons from "./PlayerStatsIcons";
import PlayerMinutesDisplay from "./PlayerMinutesDisplay";
import PlayerMatchAppearances from "./PlayerMatchAppearances";

interface PlayerStatsRowProps {
  player: EnhancedPlayerStats;
  variant?: 'default' | 'compact' | 'detailed';
  showDetailedStats?: boolean;
  className?: string;
}

const PlayerStatsRow = ({ 
  player, 
  variant = 'default',
  showDetailedStats = false,
  className 
}: PlayerStatsRowProps) => {
  const { getRoleDisplay } = usePlayerStatsFormatting();

  const getRoleIcon = (role: string) => {
    const roleIcons = {
      'captain': Star,
      's-class': Shield,
      'starter': Zap,
      'substitute': Clock
    };
    return roleIcons[role?.toLowerCase() as keyof typeof roleIcons] || null;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      'captain': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
      's-class': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
      'starter': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      'substitute': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
    };
    return colors[role?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
  };

  const RoleIcon = getRoleIcon(player.role);

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-200",
        className
      )}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="h-10 w-10 border-2 border-border/30">
            <AvatarImage src={player.ProfileURL} alt={player.name} />
            <AvatarFallback className="text-sm font-semibold">
              {player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{player.name}</p>
              {player.number && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  #{player.number}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("text-xs px-2 py-1", getRoleBadgeColor(player.role))}>
                {getRoleDisplay(player.role)}
              </Badge>
            </div>
          </div>
        </div>
        
        <PlayerStatsIcons player={player} size="sm" />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-200",
      className
    )}>
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Avatar className="h-12 w-12 border-2 border-border/30">
          <AvatarImage src={player.ProfileURL} alt={player.name} />
          <AvatarFallback className="text-sm font-semibold">
            {player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{player.name}</h3>
            {player.number && (
              <Badge variant="outline" className="text-sm px-2 py-1">
                #{player.number}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={cn("px-3 py-1", getRoleBadgeColor(player.role))}>
              {RoleIcon && <RoleIcon className="h-3 w-3 mr-1" />}
              {getRoleDisplay(player.role)}
            </Badge>
            <Badge variant="secondary" className="px-2 py-1">
              {player.position}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <PlayerStatsIcons player={player} size="md" />
        {showDetailedStats && (
          <>
            <PlayerMinutesDisplay player={player} />
            <PlayerMatchAppearances player={player} />
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerStatsRow;
