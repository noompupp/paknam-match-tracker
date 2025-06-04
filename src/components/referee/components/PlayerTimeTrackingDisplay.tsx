
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEnhancedMatchSummary } from "@/hooks/useEnhancedMatchSummary";

interface PlayerTimeTrackingDisplayProps {
  trackedPlayers: any[];
  formatTime: (seconds: number) => string;
  fixtureId?: number;
}

const PlayerTimeTrackingDisplay = ({
  trackedPlayers,
  formatTime,
  fixtureId
}: PlayerTimeTrackingDisplayProps) => {
  // Fetch database data if fixture ID is available
  const { data: enhancedData } = useEnhancedMatchSummary(fixtureId);
  
  // Use database data if available, fallback to tracked players
  const playersToDisplay = enhancedData?.playerTimes.length 
    ? enhancedData.playerTimes.map(player => ({
        id: player.playerId,
        name: player.playerName,
        team: player.team,
        totalTime: player.totalMinutes * 60, // Convert minutes back to seconds for display consistency
        isPlaying: false // Database records are completed tracking
      }))
    : trackedPlayers;

  if (playersToDisplay.length === 0) {
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
  const playersByTeam = playersToDisplay.reduce((acc, player) => {
    const team = player.team || 'Unknown Team';
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(player);
    return acc;
  }, {} as Record<string, typeof playersToDisplay>);

  const renderPlayerTime = (player: any) => {
    const minutes = Math.floor(player.totalTime / 60);
    const isPlaying = player.isPlaying;
    const isFromDatabase = enhancedData?.playerTimes.length ? true : false;
    
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
            {isFromDatabase ? "Completed" : (isPlaying ? "Playing" : "Stopped")}
          </Badge>
          <span className="font-mono text-sm">
            {minutes}min
          </span>
        </div>
      </div>
    );
  };

  const totalMinutes = playersToDisplay.reduce((sum, player) => 
    sum + Math.floor(player.totalTime / 60), 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Player Time Tracking
          <Badge variant="outline">{playersToDisplay.length} players</Badge>
          <Badge variant="secondary">{totalMinutes} total minutes</Badge>
          {enhancedData?.playerTimes.length && (
            <Badge variant="default" className="bg-green-100 text-green-800">Database</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(playersByTeam).map(([teamName, players]) => (
          <div key={teamName} className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {teamName} ({Array.isArray(players) ? players.length : 0} players)
            </h4>
            <div className="space-y-2">
              {Array.isArray(players) && players.map(renderPlayerTime)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlayerTimeTrackingDisplay;
