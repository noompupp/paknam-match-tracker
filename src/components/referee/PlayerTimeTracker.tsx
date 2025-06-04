
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Timer, UserPlus, UserMinus, AlertTriangle, Clock } from "lucide-react";
import { PlayerTime, Member } from "@/types/database";
import { SEVEN_A_SIDE_CONSTANTS, isSecondHalf, getCurrentHalfTime } from "@/utils/timeUtils";
import { debugPlayerDropdownData, ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface PlayerTimeTrackerProps {
  trackedPlayers: PlayerTime[];
  selectedPlayer: string;
  allPlayers: ProcessedPlayer[];
  onPlayerSelect: (value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime?: number;
}

const PlayerTimeTracker = ({
  trackedPlayers,
  selectedPlayer,
  allPlayers,
  onPlayerSelect,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime = 0
}: PlayerTimeTrackerProps) => {
  console.log('⏱️ PlayerTimeTracker Debug:');
  console.log('  - All players available:', allPlayers.length);
  console.log('  - Tracked players:', trackedPlayers.length);
  
  // Debug player data for time tracking
  debugPlayerDropdownData(allPlayers, "Player Time Tracker");

  // 7-a-side role-based constraints
  const getRoleConstraints = (role: string) => {
    switch (role) {
      case 'Captain':
        return { 
          maxPerHalf: null, 
          minTotal: 0, 
          description: 'No time limits',
          color: 'text-blue-600'
        };
      case 'S-class':
        return { 
          maxPerHalf: 20 * 60, 
          minTotal: 0, 
          description: 'Max 20 min/half',
          color: 'text-orange-600'
        };
      case 'Starter':
        return { 
          maxPerHalf: null, 
          minTotal: 10 * 60, 
          description: 'Min 10 min total',
          color: 'text-green-600'
        };
      default:
        return { 
          maxPerHalf: null, 
          minTotal: 0, 
          description: 'Standard rules',
          color: 'text-gray-600'
        };
    }
  };

  const getTimeStatus = (player: PlayerTime, role: string) => {
    const constraints = getRoleConstraints(role);
    const currentHalf = isSecondHalf(matchTime) ? 2 : 1;
    const currentHalfTime = getCurrentHalfTime(matchTime);
    
    // For S-class players, check per-half limits
    if (role === 'S-class' && constraints.maxPerHalf) {
      const remaining = constraints.maxPerHalf - currentHalfTime;
      if (remaining <= 0) return { status: 'exceeded', message: 'Half-time limit exceeded!' };
      if (remaining <= 3 * 60) return { status: 'critical', message: `${Math.floor(remaining / 60)}min left this half` };
      if (remaining <= 5 * 60) return { status: 'warning', message: `${Math.floor(remaining / 60)}min left this half` };
    }
    
    // For Starter players, check minimum total time
    if (role === 'Starter' && constraints.minTotal) {
      const remaining = SEVEN_A_SIDE_CONSTANTS.STANDARD_MATCH_DURATION - matchTime;
      const needed = constraints.minTotal - player.totalTime;
      if (needed > remaining && remaining < 10 * 60) {
        return { status: 'insufficient', message: `Need ${Math.ceil(needed / 60)}min more` };
      }
    }
    
    return { status: 'normal', message: 'On track' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-500 bg-red-50 border-red-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'insufficient': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const currentHalf = isSecondHalf(matchTime) ? 2 : 1;
  const halfProgress = getCurrentHalfTime(matchTime);
  const halfProgressPercent = Math.min((halfProgress / SEVEN_A_SIDE_CONSTANTS.HALF_DURATION) * 100, 100);

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Player Time Tracker (7-a-Side)
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Half {currentHalf} - {formatTime(halfProgress)}</span>
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${halfProgressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rules Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-blue-800 mb-2">7-a-Side Rules</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="text-blue-700">
              <strong>Captain:</strong> No limits
            </div>
            <div className="text-orange-700">
              <strong>S-class:</strong> Max 20min/half
            </div>
            <div className="text-green-700">
              <strong>Starter:</strong> Min 10min total
            </div>
          </div>
        </div>

        {/* Add Player Section */}
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
          <h4 className="font-semibold text-sm">Add Player to Track</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="playerSelect">Select Player</Label>
              <Select value={selectedPlayer} onValueChange={onPlayerSelect}>
                <SelectTrigger className="bg-white border-input relative z-50">
                  <SelectValue placeholder={allPlayers.length > 0 ? "Choose a player" : "No players available"} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border shadow-lg max-h-60 z-[100]">
                  {allPlayers.length === 0 ? (
                    <SelectItem value="no-players" disabled className="text-muted-foreground">
                      No players available - check fixture selection
                    </SelectItem>
                  ) : (
                    allPlayers.map((player) => {
                      const constraints = getRoleConstraints(player.position);
                      return (
                        <SelectItem 
                          key={`time-player-${player.id}`}
                          value={player.id.toString()}
                          className="hover:bg-accent focus:bg-accent cursor-pointer py-3"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                                {player.number || '?'}
                              </div>
                              <span className="font-medium">{player.name}</span>
                              <span className="text-xs text-muted-foreground">({player.team})</span>
                            </div>
                            <Badge variant="outline" className={`ml-2 ${constraints.color}`}>
                              {player.position}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              {allPlayers.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ No players found. Please ensure a fixture is selected.
                </p>
              )}
            </div>
            <div className="flex items-end">
              <Button
                onClick={onAddPlayer}
                disabled={!selectedPlayer || allPlayers.length === 0}
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
              const role = playerInfo?.position || 'Starter';
              const constraints = getRoleConstraints(role);
              const timeStatus = getTimeStatus(player, role);
              
              return (
                <div key={player.id} className={`p-3 rounded-lg border ${getStatusColor(timeStatus.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          <Badge variant="outline" className={constraints.color}>
                            {role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{player.team}</p>
                        <p className="text-xs text-muted-foreground">{constraints.description}</p>
                      </div>
                      <Badge variant={player.isPlaying ? "default" : "secondary"}>
                        {player.isPlaying ? "ON FIELD" : "OFF FIELD"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">
                          {formatTime(player.totalTime)}
                        </div>
                        <p className="text-xs">{timeStatus.message}</p>
                        {role === 'S-class' && constraints.maxPerHalf && (
                          <p className="text-xs text-muted-foreground">
                            Half limit: {formatTime(constraints.maxPerHalf)}
                          </p>
                        )}
                        {role === 'Starter' && constraints.minTotal && (
                          <p className="text-xs text-muted-foreground">
                            Min total: {formatTime(constraints.minTotal)}
                          </p>
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
                  {timeStatus.status === 'exceeded' && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Time limit exceeded - must substitute!</span>
                    </div>
                  )}
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
