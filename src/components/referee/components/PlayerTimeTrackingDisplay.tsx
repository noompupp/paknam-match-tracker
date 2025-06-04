
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlayerTimeTrackingDisplayProps {
  trackedPlayers: any[];
  formatTime: (seconds: number) => string;
}

const PlayerTimeTrackingDisplay = ({
  trackedPlayers,
  formatTime
}: PlayerTimeTrackingDisplayProps) => {
  if (trackedPlayers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Player Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No players are being tracked</p>
        </CardContent>
      </Card>
    );
  }

  // Group players by team for better organization
  const playersByTeam = trackedPlayers.reduce((acc, player) => {
    const team = player.team || 'Unknown Team';
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(player);
    return acc;
  }, {} as Record<string, typeof trackedPlayers>);

  const renderPlayerTime = (player: any) => {
    const minutes = Math.floor(player.totalTime / 60);
    const isPlaying = player.isPlaying;
    
    return (
      <div key={`${player.id}-${player.name}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="font-medium">{player.name}</span>
            {player.team && (
              <span className="text-sm text-muted-foreground ml-2">({player.team})</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isPlaying ? "default" : "secondary"}>
            {isPlaying ? "Playing" : "Stopped"}
          </Badge>
          <span className="font-mono text-sm">
            {minutes}min
          </span>
        </div>
      </div>
    );
  };

  const totalMinutes = trackedPlayers.reduce((sum, player) => 
    sum + Math.floor(player.totalTime / 60), 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Player Time Tracking
          <Badge variant="outline">{trackedPlayers.length} players</Badge>
          <Badge variant="secondary">{totalMinutes} total minutes</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(playersByTeam).map(([teamName, players]) => (
          <div key={teamName} className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {teamName} ({players.length} players)
            </h4>
            <div className="space-y-2">
              {players.map(renderPlayerTime)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlayerTimeTrackingDisplay;
