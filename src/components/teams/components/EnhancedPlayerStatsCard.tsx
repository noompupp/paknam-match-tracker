import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Clock, Award, Users } from "lucide-react";
import PlayerAvatar from "@/components/shared/PlayerAvatar";
import { Member, Team } from "@/types/database";
import { cn } from "@/lib/utils";

interface EnhancedPlayerStatsCardProps {
  player: Member;
  teamData?: Team;
  index: number;
  isTopScorer?: boolean;
  isTopAssister?: boolean;
  variant?: 'default' | 'compact';
}

const EnhancedPlayerStatsCard = ({ 
  player, 
  teamData, 
  index, 
  isTopScorer = false, 
  isTopAssister = false,
  variant = 'default'
}: EnhancedPlayerStatsCardProps) => {
  // Helper function to convert seconds to minutes
  const formatPlayingTime = (totalMinutesPlayed: number | null | undefined): string => {
    if (!totalMinutesPlayed || totalMinutesPlayed === 0) return '0';
    
    // If the value seems to be in seconds (very large number), convert to minutes
    if (totalMinutesPlayed > 1000) {
      return Math.round(totalMinutesPlayed / 60).toString();
    }
    
    // Otherwise assume it's already in minutes
    return Math.round(totalMinutesPlayed).toString();
  };

  const hasStats = (player.goals || 0) > 0 || (player.assists || 0) > 0 || (player.total_minutes_played || 0) > 0;

  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border border-border/30 transition-all duration-200",
      "hover:border-border/50 hover:bg-muted/30 group",
      variant === 'compact' ? "p-3" : "p-4",
      "bg-background/60 backdrop-blur-sm"
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative flex-shrink-0">
          <PlayerAvatar 
            player={{
              id: player.id,
              name: player.name || 'Unknown Player',
              number: player.number || (index + 1).toString(),
              position: player.position || 'Player',
              role: 'Player',
              goals: player.goals || 0,
              assists: player.assists || 0,
              yellow_cards: player.yellow_cards || 0,
              red_cards: player.red_cards || 0,
              total_minutes_played: player.total_minutes_played || 0,
              matches_played: player.matches_played || 0,
              team_id: player.team_id || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ProfileURL: player.ProfileURL
            }}
            team={teamData}
            size="large" 
            showStats={true}
          />
          
          {/* Top performer indicators */}
          {(isTopScorer || isTopAssister) && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm">
              {isTopScorer ? (
                <Award className="h-3 w-3 text-white" />
              ) : (
                <Trophy className="h-3 w-3 text-white" />
              )}
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate text-sm">
              {player.name || 'Unknown Player'}
            </h3>
            {(isTopScorer || isTopAssister) && (
              <div className="flex gap-1">
                {isTopScorer && <Award className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                {isTopAssister && <Trophy className="h-3 w-3 text-blue-500 flex-shrink-0" />}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {player.position || 'Player'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
        {hasStats ? (
          <>
            {/* Goals */}
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-green-600 hidden sm:block" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium text-xs px-1.5 py-0.5">
                <span className="sm:hidden">G:</span>{player.goals || 0}
              </Badge>
            </div>
            
            {/* Assists */}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-blue-600 hidden sm:block" />
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-xs px-1.5 py-0.5">
                <span className="sm:hidden">A:</span>{player.assists || 0}
              </Badge>
            </div>

            {/* Minutes played */}
            {player.total_minutes_played && player.total_minutes_played > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-600 hidden sm:block" />
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs px-1.5 py-0.5">
                  {formatPlayingTime(player.total_minutes_played)}m
                </Badge>
              </div>
            )}

            {/* Cards */}
            {((player.yellow_cards && player.yellow_cards > 0) || (player.red_cards && player.red_cards > 0)) && (
              <div className="flex gap-1">
                {player.yellow_cards && player.yellow_cards > 0 && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs px-1.5 py-0.5">
                    {player.yellow_cards}Y
                  </Badge>
                )}
                {player.red_cards && player.red_cards > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-1.5 py-0.5">
                    {player.red_cards}R
                  </Badge>
                )}
              </div>
            )}
          </>
        ) : (
          <Badge variant="outline" className="text-muted-foreground text-xs px-2 py-1">
            No stats
          </Badge>
        )}
      </div>
    </div>
  );
};

export default EnhancedPlayerStatsCard;
