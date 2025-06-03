
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Timer, UserPlus, UserMinus } from "lucide-react";
import { PlayerTime, Member } from "@/types/database";

interface PlayerTimeTrackerProps {
  trackedPlayers: PlayerTime[];
  selectedPlayer: string;
  allPlayers: Array<{name: string, team: string, number: number, position: string, id: number}>;
  onPlayerSelect: (value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
}

const PlayerTimeTracker = ({
  trackedPlayers,
  selectedPlayer,
  allPlayers,
  onPlayerSelect,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime
}: PlayerTimeTrackerProps) => {
  // Role-based time constraints
  const getRoleConstraints = (position: string) => {
    const constraints = {
      'Goalkeeper': { maxTime: 90 * 60, warning: 80 * 60 }, // 90 min max, warn at 80
      'Defender': { maxTime: 90 * 60, warning: 75 * 60 },   // 90 min max, warn at 75
      'Midfielder': { maxTime: 85 * 60, warning: 70 * 60 }, // 85 min max, warn at 70
      'Forward': { maxTime: 80 * 60, warning: 65 * 60 },    // 80 min max, warn at 65
    };
    return constraints[position as keyof typeof constraints] || constraints['Midfielder'];
  };

  const getTimeStatus = (player: PlayerTime, position: string) => {
    const constraints = getRoleConstraints(position);
    if (player.totalTime >= constraints.maxTime) return 'exceeded';
    if (player.totalTime >= constraints.warning) return 'warning';
    return 'normal';
  };

  const getTimeStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Player Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Player Section */}
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-sm">Add Player to Track</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="playerSelect">Select Player</Label>
              <Select value={selectedPlayer} onValueChange={onPlayerSelect}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg max-h-60 z-50">
                  {allPlayers.map((player) => (
                    <SelectItem 
                      key={player.id} 
                      value={player.id.toString()}
                      className="hover:bg-accent focus:bg-accent cursor-pointer"
                    >
                      #{player.number} {player.name} ({player.team}) - {player.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={onAddPlayer}
                disabled={!selectedPlayer}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </div>
          </div>
        </div>

        {/* Tracked Players */}
        {trackedPlayers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No players being tracked</p>
        ) : (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Tracked Players</h4>
            {trackedPlayers.map((player) => {
              const playerInfo = allPlayers.find(p => p.id === player.id);
              const position = playerInfo?.position || 'Midfielder';
              const timeStatus = getTimeStatus(player, position);
              const constraints = getRoleConstraints(position);
              
              return (
                <div key={player.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <p className="text-sm text-muted-foreground">{player.team} - {position}</p>
                    </div>
                    <Badge variant={player.isPlaying ? "default" : "secondary"}>
                      {player.isPlaying ? "ON FIELD" : "OFF FIELD"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-mono text-lg font-bold ${getTimeStatusColor(timeStatus)}`}>
                        {formatTime(player.totalTime)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Max: {formatTime(constraints.maxTime)}
                      </p>
                      {timeStatus === 'exceeded' && (
                        <p className="text-xs text-red-500 font-medium">Time exceeded!</p>
                      )}
                      {timeStatus === 'warning' && (
                        <p className="text-xs text-yellow-500 font-medium">Approaching limit</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={player.isPlaying ? "destructive" : "default"}
                        onClick={() => onTogglePlayerTime(player.id)}
                      >
                        {player.isPlaying ? "Sub Out" : "Sub In"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemovePlayer(player.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerTimeTracker;
