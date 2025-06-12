
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trophy, Target, Clock, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";
import { usePlayerStatsFormatting } from "@/hooks/useEnhancedTeamStats";

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
        
        <div className="flex items-center gap-1 sm:gap-3 text-xs text-muted-foreground flex-shrink-0 ml-2">
          <div className="text-center min-w-[32px]">
            <p className="font-semibold text-foreground">{formatStat(player.goals)}</p>
            <p className="text-[10px]">G</p>
          </div>
          <div className="text-center min-w-[32px]">
            <p className="font-semibold text-foreground">{formatStat(player.assists)}</p>
            <p className="text-[10px]">A</p>
          </div>
          <div className="text-center min-w-[32px]">
            <p className="font-semibold text-foreground">{formatStat(player.matches_played)}</p>
            <p className="text-[10px]">M</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("premier-league-card hover:shadow-md transition-all duration-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Player Avatar & Basic Info */}
          <div className="flex-shrink-0">
            <Avatar className="h-16 w-16 border-2 border-border/30">
              <AvatarImage src={player.ProfileURL} alt={player.name} />
              <AvatarFallback className="text-lg font-semibold">
                {player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
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
                    {getRoleIcon(player.role) && (
                      <getRoleIcon(player.role)! className="h-3 w-3 mr-1" />
                    )}
                    {getRoleDisplay(player.role)}
                  </Badge>
                  <Badge variant="secondary" className="px-2 py-1">
                    {getPositionDisplay(player.position)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="font-bold text-lg text-foreground">{formatStat(player.goals)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Goals</p>
                {showDetailedStats && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ({player.goalsPerMatch}/match)
                  </p>
                )}
              </div>

              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-lg text-foreground">{formatStat(player.assists)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Assists</p>
                {showDetailedStats && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ({player.assistsPerMatch}/match)
                  </p>
                )}
              </div>

              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-lg text-foreground">{formatStat(player.matches_played)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Matches</p>
                {showDetailedStats && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatMinutes(player.total_minutes_played)}
                  </p>
                )}
              </div>

              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-lg text-foreground">{formatStat(player.contributionScore)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Score</p>
                {showDetailedStats && player.minutesPerMatch > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {player.minutesPerMatch}min/match
                  </p>
                )}
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
