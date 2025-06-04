
import { Award } from "lucide-react";

interface PlayerPerformanceHighlightsProps {
  trackedPlayers: any[];
  formatTime: (seconds: number) => string;
}

const PlayerPerformanceHighlights = ({
  trackedPlayers,
  formatTime
}: PlayerPerformanceHighlightsProps) => {
  const topPlayer = trackedPlayers.length > 0 ? 
    trackedPlayers.reduce((max, player) => player.totalTime > max.totalTime ? player : max) : null;

  if (!topPlayer) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <Award className="h-4 w-4" />
        Player Performance Highlights
      </h4>
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Most Active Player</p>
            <p className="text-lg font-bold text-orange-600">{topPlayer.name}</p>
            <p className="text-sm text-muted-foreground">{topPlayer.team}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">{formatTime(topPlayer.totalTime)}</p>
            <p className="text-sm text-muted-foreground">Playing Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPerformanceHighlights;
