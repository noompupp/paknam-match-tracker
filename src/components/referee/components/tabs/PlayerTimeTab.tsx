import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Timer, Users, Play, Pause, UserMinus } from "lucide-react";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface PlayerTimeTabProps {
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  trackedPlayers: any[];
  selectedTimePlayer: string;
  selectedTimeTeam: string;
  matchTime: number;
  setSelectedTimePlayer: (value: string) => void;
  setSelectedTimeTeam: (value: string) => void;
  addPlayer: (player: any) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
}

const PlayerTimeTab = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  trackedPlayers,
  selectedTimePlayer,
  selectedTimeTeam,
  matchTime,
  setSelectedTimePlayer,
  setSelectedTimeTeam,
  addPlayer,
  removePlayer,
  togglePlayerTime,
  formatTime
}: PlayerTimeTabProps) => {
  const availablePlayers = selectedTimeTeam === 'home' 
    ? homeTeamPlayers || []
    : selectedTimeTeam === 'away' 
    ? awayTeamPlayers || []
    : allPlayers;

  const handleAddPlayer = () => {
    if (!selectedTimePlayer) return;
    
    const player = availablePlayers.find(p => p.id.toString() === selectedTimePlayer);
    if (player) {
      addPlayer({
        id: player.id,
        name: player.name,
        team: player.team,
        startTime: matchTime,
        isPlaying: true,
        totalTime: 0
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <Card className="referee-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Add Player to Track
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team</label>
              <Select value={selectedTimeTeam} onValueChange={setSelectedTimeTeam}>
                <SelectTrigger className="referee-select">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Team</SelectItem>
                  <SelectItem value="away">Away Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Player</label>
              <Select value={selectedTimePlayer} onValueChange={setSelectedTimePlayer}>
                <SelectTrigger className="referee-select">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name} ({player.team})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAddPlayer}
                disabled={!selectedTimePlayer || !selectedTimeTeam}
                className="w-full referee-button-primary"
              >
                <Users className="h-4 w-4 mr-2" />
                Track Player
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracked Players */}
      <Card className="referee-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Tracked Players ({trackedPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackedPlayers.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No players being tracked</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add players above to start tracking their playing time
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trackedPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.team}</p>
                    </div>
                    <Badge variant={player.isPlaying ? "default" : "secondary"}>
                      {player.isPlaying ? "Playing" : "Benched"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-sm">
                        {formatTime(player.totalTime + (player.isPlaying ? matchTime - player.startTime : 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Time</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePlayerTime(player.id)}
                      >
                        {player.isPlaying ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTimeTab;
