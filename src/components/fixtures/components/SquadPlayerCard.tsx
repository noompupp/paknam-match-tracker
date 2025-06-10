
import { Badge } from "@/components/ui/badge";
import { Star, Trophy } from "lucide-react";
import { Member } from "@/types/database";

interface SquadPlayerCardProps {
  player: Member;
  isTopScorer?: boolean;
  isTopAssister?: boolean;
}

const SquadPlayerCard = ({ player, isTopScorer = false, isTopAssister = false }: SquadPlayerCardProps) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-shrink-0">
          {player.number && (
            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
              {player.number}
            </Badge>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{player.name}</p>
            {player.nickname && (
              <p className="text-xs text-muted-foreground truncate leading-tight">
                "{player.nickname}"
              </p>
            )}
          </div>
        </div>
        {(isTopScorer || isTopAssister) && (
          <div className="flex gap-1 flex-shrink-0">
            {isTopScorer && <Star className="h-3 w-3 text-yellow-500" />}
            {isTopAssister && <Trophy className="h-3 w-3 text-blue-500" />}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-shrink-0">
        <div className="text-center">
          <p className="font-semibold text-foreground">{player.goals || 0}</p>
          <p className="hidden sm:block">Goals</p>
          <p className="sm:hidden">G</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{player.assists || 0}</p>
          <p className="hidden sm:block">Assists</p>
          <p className="sm:hidden">A</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{player.matches_played || 0}</p>
          <p className="hidden sm:block">Apps</p>
          <p className="sm:hidden">M</p>
        </div>
      </div>
    </div>
  );
};

export default SquadPlayerCard;
