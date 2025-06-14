
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Clock, Zap, Award } from "lucide-react";
import PlayerAvatar from "@/components/shared/PlayerAvatar";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import { Team, Member } from "@/types/database";
import { toAvatarPlayer } from "./PlayerCardAvatarUtils";

interface MobileCompactPlayerCardProps {
  player: Member;
  teamData?: Team;
  index: number;
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

const MobileCompactPlayerCard = ({
  player,
  teamData,
  index,
  isTopScorer = false,
  isTopAssister = false,
}: MobileCompactPlayerCardProps) => {
  return (
    <div className="flex items-center rounded-lg border border-border/30 transition-all duration-200 hover:border-border/50 hover:bg-muted/30 group bg-background/60 backdrop-blur-sm px-2 py-2">
      <div className="relative flex-shrink-0 mr-2">
        <PlayerAvatar
          player={toAvatarPlayer(player, index)}
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
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between min-w-0">
          <span className="font-medium truncate text-xs leading-tight text-foreground" title={player.name || ''}>
            {player.name || 'Unknown Player'}
            {!!player.number && (
              <span className="ml-1 text-[10px] text-muted-foreground font-light">
                #{player.number}
              </span>
            )}
          </span>
          <PlayerRoleBadge role={player.role || "Player"} size="sm" className="ml-1" />
        </div>
        <div className="flex flex-wrap gap-2 mt-1 items-center">
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-0.5">
              <Trophy className="h-3 w-3 text-yellow-600" aria-label="Goals" />
              <span className="text-xs font-semibold text-foreground">{player.goals || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Target className="h-3 w-3 text-blue-600" aria-label="Assists" />
              <span className="text-xs font-semibold text-foreground">{player.assists || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Clock className="h-3 w-3 text-green-700" aria-label="Minutes played" />
              <span className="text-xs font-semibold text-foreground">{formatPlayingTime(player.total_minutes_played)}m</span>
            </div>
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
};

export default MobileCompactPlayerCard;
