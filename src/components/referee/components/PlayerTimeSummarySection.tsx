
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";
import { PlayerTime } from "@/types/database";

interface PlayerTimeSummarySectionProps {
  trackedPlayers: PlayerTime[];
  formatTime: (seconds: number) => string;
}

const PlayerTimeSummarySection = ({
  trackedPlayers,
  formatTime
}: PlayerTimeSummarySectionProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <Timer className="h-4 w-4" />
        Player Time Summary
      </h4>
      
      {trackedPlayers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No players tracked</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {trackedPlayers
            .sort((a, b) => b.totalTime - a.totalTime)
            .map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                <div>
                  <span className="font-medium">{player.name}</span>
                  <span className="text-muted-foreground ml-2">({player.team})</span>
                </div>
                <div className="text-right">
                  <span className="font-mono">{formatTime(player.totalTime)}</span>
                  <Badge variant={player.isPlaying ? "default" : "secondary"} className="ml-2 text-xs">
                    {player.isPlaying ? "ON" : "OFF"}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PlayerTimeSummarySection;
