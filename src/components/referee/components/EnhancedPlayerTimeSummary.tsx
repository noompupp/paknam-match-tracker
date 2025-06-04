
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

interface EnhancedPlayerTimeSummaryProps {
  trackedPlayers: any[];
  allPlayers: any[];
  matchTime: number;
  formatTime: (seconds: number) => string;
}

const EnhancedPlayerTimeSummary = ({
  trackedPlayers,
  allPlayers,
  matchTime,
  formatTime
}: EnhancedPlayerTimeSummaryProps) => {
  const getPlayerRole = (playerId: number) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player?.position || 'Player';
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <Timer className="h-4 w-4" />
        Player Time Summary ({trackedPlayers.length} players)
      </h4>
      
      {trackedPlayers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No players tracked</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {trackedPlayers
            .sort((a, b) => b.totalTime - a.totalTime)
            .map((player) => {
              const role = getPlayerRole(player.id);
              const playTimePercent = Math.round((player.totalTime / matchTime) * 100);
              return (
                <div key={player.id} className="flex items-center justify-between p-3 bg-muted/20 rounded text-sm border">
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground text-xs">({player.team})</span>
                        <Badge variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{formatTime(player.totalTime)}</span>
                      <Badge variant={player.isPlaying ? "default" : "secondary"} className="text-xs">
                        {player.isPlaying ? "ON" : "OFF"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{playTimePercent}% of match</p>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default EnhancedPlayerTimeSummary;
