
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface PlayerCardProps {
  player: any;
  index: number;
}

const PlayerCard = ({ player, index }: PlayerCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-muted">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg border-2 border-primary/20">
          {player.number || index + 1}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-lg">{player.name}</p>
            {player.role === "Captain" && (
              <Badge variant="default" className="text-xs bg-yellow-600">
                Captain
              </Badge>
            )}
            {player.role === "S-class" && (
              <Badge variant="default" className="text-xs bg-purple-600">
                S-class
              </Badge>
            )}
            {player.role === "Starter" && (
              <Badge variant="outline" className="text-xs">
                Starter
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium">{player.position}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="grid grid-cols-5 gap-3 mb-1">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{player.goals || 0}</p>
            <p className="text-xs text-muted-foreground">Goals</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{player.assists || 0}</p>
            <p className="text-xs text-muted-foreground">Assists</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-600">{player.yellow_cards || 0}</p>
            <p className="text-xs text-muted-foreground">Yellow</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-600">{player.red_cards || 0}</p>
            <p className="text-xs text-muted-foreground">Red</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">{Math.round(player.total_minutes_played || 0)}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
        </div>
        {((player.goals || 0) > 0 || (player.assists || 0) > 0) && (
          <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>This season</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
