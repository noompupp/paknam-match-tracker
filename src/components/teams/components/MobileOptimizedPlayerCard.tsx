import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Clock, Zap, Award } from "lucide-react";
import { useState } from "react";
import PlayerAvatar from "@/components/shared/PlayerAvatar";
import { Member, Team } from "@/types/database";
import { cn } from "@/lib/utils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import PlayerRoleBadge from "@/components/ui/player-role-badge";

interface MobileOptimizedPlayerCardProps {
  player: Member;
  teamData?: Team;
  index: number;
  isTopScorer?: boolean;
  isTopAssister?: boolean;
  variant?: 'default' | 'compact';
}

const MobileOptimizedPlayerCard = ({ 
  player, 
  teamData, 
  index, 
  isTopScorer = false, 
  isTopAssister = false,
  variant = 'default'
}: MobileOptimizedPlayerCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMobile, isPortrait } = useDeviceOrientation();
  
  // Helper function to format playing time
  const formatPlayingTime = (totalMinutesPlayed: number | null | undefined): string => {
    if (!totalMinutesPlayed || totalMinutesPlayed === 0) return '0';
    if (totalMinutesPlayed > 1000) {
      return Math.round(totalMinutesPlayed / 60).toString();
    }
    return Math.round(totalMinutesPlayed).toString();
  };
  const hasStats = (player.goals || 0) > 0 || (player.assists || 0) > 0 || (player.total_minutes_played || 0) > 0;
  const hasExtendedStats = (player.yellow_cards || 0) > 0 || (player.red_cards || 0) > 0 || (player.total_minutes_played || 0) > 0;

  // Enhanced mobile portrait "compact" layout: Avatar + stacked info + mini stats
  if (isMobile && isPortrait && variant === 'compact') {
    return (
      <div className="flex items-center rounded-lg border border-border/30 transition-all duration-200 hover:border-border/50 hover:bg-muted/30 group bg-background/60 backdrop-blur-sm px-2 py-2">
        {/* Avatar */}
        <div className="relative flex-shrink-0 mr-2">
          <PlayerAvatar 
            player={{
              id: player.id,
              name: player.name || 'Unknown Player',
              number: player.number || (index + 1).toString(),
              position: player.position || 'Player',
              role: player.role || "Player",
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
            size="small" 
            showStats={false}
          />
          {(isTopScorer || isTopAssister) && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
              <Award className="h-1.5 w-1.5 text-white" />
            </div>
          )}
        </div>
        
        {/* Info Block: Name, number, role, and stats */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between min-w-0">
            {/* Name + shirt number (e.g., #7) */}
            <span className="font-medium truncate text-xs leading-tight text-foreground" title={player.name || ''}>
              {player.name || 'Unknown Player'}
              {!!player.number && (
                <span className="ml-1 text-[10px] text-muted-foreground font-light">
                  #{player.number}
                </span>
              )}
            </span>
            {/* Player role badge, right-aligned */}
            <PlayerRoleBadge role={player.role || "Player"} size="sm" className="ml-1" />
          </div>
          <div className="flex flex-wrap gap-2 mt-1 items-center">
            {/* Mini stats row with icons */}
            <div className="flex gap-2 items-center">
              {/* Goals */}
              <div className="flex items-center gap-0.5">
                <Trophy className="h-3 w-3 text-yellow-600" aria-label="Goals" />
                <span className="text-xs font-semibold text-foreground">{player.goals || 0}</span>
              </div>
              {/* Assists */}
              <div className="flex items-center gap-0.5">
                <Target className="h-3 w-3 text-blue-600" aria-label="Assists" />
                <span className="text-xs font-semibold text-foreground">{player.assists || 0}</span>
              </div>
              {/* Minutes played */}
              <div className="flex items-center gap-0.5">
                <Clock className="h-3 w-3 text-green-700" aria-label="Minutes played" />
                <span className="text-xs font-semibold text-foreground">{formatPlayingTime(player.total_minutes_played)}m</span>
              </div>
              {/* Contribution Score - only show if enough space */}
              {(player.goals || 0) + (player.assists || 0) + (player.total_minutes_played || 0) > 0 && (
                <div className="flex items-center gap-0.5">
                  <Zap className="h-3 w-3 text-purple-600" aria-label="Contribution Score" />
                  <span className="text-xs font-semibold text-foreground">{player.contributionScore ?? (player.goals * 3 + player.assists * 2 + Math.floor((player.total_minutes_played || 0)/90))}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile landscape or tablet mode - 2-column layout
  if (isMobile && !isPortrait) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border/30 transition-all duration-200 hover:border-border/50 hover:bg-muted/30 group bg-background/60 backdrop-blur-sm p-3">
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
            
            {(isTopScorer || isTopAssister) && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                <Award className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
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
        
        <div className="grid grid-cols-2 gap-1 flex-shrink-0 ml-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0.5 text-center">
            {player.goals || 0}G
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5 py-0.5 text-center">
            {player.assists || 0}A
          </Badge>
        </div>
      </div>
    );
  }

  // Desktop and default mobile view with expandable details
  return (
    <div className={cn(
      "rounded-lg border border-border/30 transition-all duration-200",
      "hover:border-border/50 hover:bg-muted/30 group",
      "bg-background/60 backdrop-blur-sm"
    )}>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => isMobile && hasExtendedStats && setIsExpanded(!isExpanded)}
      >
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
        
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {hasStats ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-green-600 hidden sm:block" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium text-xs px-1.5 py-0.5">
                  <span className="sm:hidden">G:</span>{player.goals || 0}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-600 hidden sm:block" />
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-xs px-1.5 py-0.5">
                  <span className="sm:hidden">A:</span>{player.assists || 0}
                </Badge>
              </div>

              {!isMobile && player.total_minutes_played && player.total_minutes_played > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-600" />
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs px-1.5 py-0.5">
                    {formatPlayingTime(player.total_minutes_played)}m
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-xs px-2 py-1">
              No stats
            </Badge>
          )}
          
          {isMobile && hasExtendedStats && (
            <button className="p-1 hover:bg-muted rounded">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expandable details section for mobile */}
      {isMobile && isExpanded && hasExtendedStats && (
        <div className="border-t border-border/30 p-3 bg-muted/20">
          <div className="grid grid-cols-2 gap-2">
            {player.total_minutes_played && player.total_minutes_played > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-600" />
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs px-2 py-1">
                  {formatPlayingTime(player.total_minutes_played)}m played
                </Badge>
              </div>
            )}
            
            {((player.yellow_cards && player.yellow_cards > 0) || (player.red_cards && player.red_cards > 0)) && (
              <div className="flex gap-1">
                {player.yellow_cards && player.yellow_cards > 0 && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs px-2 py-1">
                    {player.yellow_cards} Yellow
                  </Badge>
                )}
                {player.red_cards && player.red_cards > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-1">
                    {player.red_cards} Red
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedPlayerCard;
