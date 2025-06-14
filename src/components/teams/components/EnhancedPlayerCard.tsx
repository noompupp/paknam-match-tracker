import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trophy, Target, Clock, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";
import { usePlayerStatsFormatting } from "@/hooks/useEnhancedTeamStats";
import PlayerStatsBar from "./PlayerStatsBar";

/**
 * Always render AvatarImage and AvatarFallback for player avatar.
 * - Use initials if no image.
 * - Never conditionally hide Avatar (aside from loading/props).
 */

interface EnhancedPlayerCardProps {
  player: EnhancedPlayerStats;
  showDetailedStats?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const EnhancedPlayerCard = ({ 
  player, 
  showDetailedStats = false, 
  variant = 'default',
  className 
}: EnhancedPlayerCardProps) => {
  const { formatMinutes, formatStat, getRoleDisplay, getPositionDisplay } = usePlayerStatsFormatting();

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

  // Always show avatar image/initials for all layouts
  if (variant === 'compact') {
    // MOBILE LIST VIEW — NOW RESTORES FULL STAT BAR BELOW NAME/ROLE
    return (
      <div className={cn(
        "flex flex-col gap-1 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-200 w-full",
        className
      )}>
        <div className="flex items-center gap-3 min-w-0 w-full">
          <Avatar className="h-10 w-10 border-2 border-border/30">
            <AvatarImage src={player.ProfileURL} alt={player.name} />
            <AvatarFallback className="text-sm font-semibold">
              {player.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "?"}
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
        {/* Responsive stat bar under name/role: FLEX WRAP FOR LONGER NUMBERS */}
        <PlayerStatsBar player={player} size="compact" className="mt-2" />
      </div>
    );
  }

  // Default = desktop/tablet = full card
  // ➜ GRID VIEW on mobile needs better layout!
  const RoleIcon = getRoleIcon(player.role);

  return (
    <Card className={cn(
      "premier-league-card hover:shadow-md transition-all duration-200",
      "select-none",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Player Avatar & Basic Info */}
          <div className="flex-shrink-0">
            <Avatar className="h-16 w-16 border-2 border-border/30">
              <AvatarImage src={player.ProfileURL} alt={player.name} />
              <AvatarFallback className="text-lg font-semibold">
                {player.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          {/* Player Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-foreground truncate">{player.name}</h3>
                  {player.number && (
                    <Badge variant="outline" className="text-sm px-2 py-1">
                      #{player.number}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={cn("px-3 py-1", getRoleBadgeColor(player.role))}>
                    {RoleIcon && (
                      <RoleIcon className="h-3 w-3 mr-1" />
                    )}
                    {getRoleDisplay(player.role)}
                  </Badge>
                  <Badge variant="secondary" className="px-2 py-1">
                    {getPositionDisplay(player.position)}
                  </Badge>
                </div>
              </div>
            </div>
            {/* Responsive Stat Bar for Grid Card */}
            <div className="w-full">
              <div className="block md:hidden">
                <PlayerStatsBar player={player} size="compact" className="mt-1" />
              </div>
              <div className="hidden md:block">
                {/* DESKTOP/TABLET: improved stat bar with horizontal stat row per spec */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {/* GOALS */}
                  <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg min-h-[72px] py-2 px-2">
                    <div className="flex items-center gap-2 w-full h-full">
                      <Trophy className="h-5 w-5 text-yellow-600 shrink-0" />
                      <span className="font-medium text-foreground truncate text-sm">
                        Goals: <span className="font-bold text-lg">{formatStat(player.goals)}</span>
                        {showDetailedStats && player.goalsPerMatch !== undefined && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({player.goalsPerMatch}/match)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  {/* ASSISTS */}
                  <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg min-h-[72px] py-2 px-2">
                    <div className="flex items-center gap-2 w-full h-full">
                      <Target className="h-5 w-5 text-blue-600 shrink-0" />
                      <span className="font-medium text-foreground truncate text-sm">
                        Assists: <span className="font-bold text-lg">{formatStat(player.assists)}</span>
                        {showDetailedStats && player.assistsPerMatch !== undefined && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({player.assistsPerMatch}/match)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  {/* MATCHES */}
                  <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg min-h-[72px] py-2 px-2">
                    <div className="flex items-center gap-2 w-full h-full">
                      <Clock className="h-5 w-5 text-green-600 shrink-0" />
                      <span className="font-medium text-foreground truncate text-sm">
                        Matches: <span className="font-bold text-lg">{formatStat(player.matches_played)}</span>
                        {showDetailedStats && player.total_minutes_played !== undefined && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {formatMinutes(player.total_minutes_played)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  {/* CONTRIBUTION/SCORE */}
                  <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg min-h-[72px] py-2 px-2">
                    <div className="flex items-center gap-2 w-full h-full">
                      <Zap className="h-5 w-5 text-purple-600 shrink-0" />
                      <span className="font-medium text-foreground truncate text-sm">
                        Score: <span className="font-bold text-lg">{formatStat(player.contributionScore)}</span>
                        {showDetailedStats && player.minutesPerMatch > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {player.minutesPerMatch}min/match
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Additional Details for Detailed Variant */}
            {variant === 'detailed' && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Discipline</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={player.yellow_cards > 0 ? "destructive" : "outline"} className="text-xs">
                        {player.yellow_cards} Yellow
                      </Badge>
                      <Badge variant={player.red_cards > 0 ? "destructive" : "outline"} className="text-xs">
                        {player.red_cards} Red
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Efficiency</p>
                    <p className="font-medium mt-1">
                      {player.total_minutes_played > 0 ? 
                        Math.round((player.goals + player.assists) / (player.total_minutes_played / 90) * 100) / 100 : 0
                      } contributions/90min
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPlayerCard;

// ⚠️ This file is now 240+ lines and may need to be split into smaller components soon for maintainability!
