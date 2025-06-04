import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface PlayerTimeTrackingDisplayProps {
  trackedPlayers: any[];
  formatTime: (seconds: number) => string;
}

const PlayerTimeTrackingDisplay = ({
  trackedPlayers,
  formatTime
}: PlayerTimeTrackingDisplayProps) => {
  if (trackedPlayers.length === 0) return null;

  // Format time consistently as minutes
  const formatTimeInMinutes = (timeValue: number) => {
    // If timeValue is already in minutes (which it should be after conversion), display it
    // Otherwise convert from seconds to minutes
    const minutes = timeValue < 200 ? timeValue : Math.floor(timeValue / 60);
    return `${minutes} min`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Player Time Tracking ({trackedPlayers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trackedPlayers.map((player, index) => (
            <div key={`tracked-player-${index}-${player.id}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{player.name}</span>
                <span className="text-sm text-muted-foreground ml-2">({player.team})</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={player.isPlaying ? "default" : "secondary"}>
                  {player.isPlaying ? 'Playing' : 'Not Playing'}
                </Badge>
                <span className="text-sm font-mono">{formatTimeInMinutes(player.totalTime)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerTimeTrackingDisplay;
