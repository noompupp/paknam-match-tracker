
import { Badge } from "@/components/ui/badge";
import { Target, Users, Award, Trophy, Clock, ChevronUp, ChevronDown } from "lucide-react";
import PlayerAvatar from "@/components/shared/PlayerAvatar";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Member, Team } from "@/types/database";
import { toAvatarPlayer } from "./PlayerCardAvatarUtils";

interface DesktopPlayerCardProps {
  player: Member;
  teamData?: Team;
  index: number;
  isMobile: boolean;
  hasStats: boolean;
  hasExtendedStats: boolean;
  isTopScorer?: boolean;
  isTopAssister?: boolean;
}

const formatPlayingTime = (totalMinutesPlayed: number | null | undefined): string => {
  if (!totalMinutesPlayed || totalMinutesPlayed === 0) return '0';
  if (totalMinutesPlayed > 1000) {
    return Math.round(totalMinutesPlayed / 60).toString();
  }
  return Math.round(totalMinutesPlayed).toString();
};

const DesktopPlayerCard = ({
  player,
  teamData,
  index,
  isMobile,
  hasStats,
  hasExtendedStats,
  isTopScorer = false,
  isTopAssister = false,
}: DesktopPlayerCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
              player={toAvatarPlayer(player, index)}
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

export default DesktopPlayerCard;
