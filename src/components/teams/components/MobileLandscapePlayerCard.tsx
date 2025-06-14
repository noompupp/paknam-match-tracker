
import { Badge } from "@/components/ui/badge";
import { Award, Trophy } from "lucide-react";
import PlayerAvatar from "@/components/shared/PlayerAvatar";
import { Team, Member } from "@/types/database";
import { toAvatarPlayer } from "./PlayerCardAvatarUtils";

interface MobileLandscapePlayerCardProps {
  player: Member;
  teamData?: Team;
  index: number;
  isTopScorer?: boolean;
  isTopAssister?: boolean;
}

const MobileLandscapePlayerCard = ({
  player,
  teamData,
  index,
  isTopScorer = false,
  isTopAssister = false,
}: MobileLandscapePlayerCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/30 transition-all duration-200 hover:border-border/50 hover:bg-muted/30 group bg-background/60 backdrop-blur-sm p-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative flex-shrink-0">
          <PlayerAvatar
            player={toAvatarPlayer(player, index)}
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
};

export default MobileLandscapePlayerCard;
