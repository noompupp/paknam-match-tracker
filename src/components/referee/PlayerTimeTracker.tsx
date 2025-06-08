
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Timer, UserPlus, UserMinus, AlertTriangle, Clock, HomeIcon, Users2 } from "lucide-react";
import { PlayerTime, Member } from "@/types/database";
import { SEVEN_A_SIDE_CONSTANTS, isSecondHalf, getCurrentHalfTime } from "@/utils/timeUtils";
import { debugPlayerDropdownData, ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import SevenASideValidationPanel from "./components/SevenASideValidationPanel";

interface PlayerTimeTrackerProps {
  trackedPlayers: PlayerTime[];
  selectedPlayer: string;
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  selectedTimeTeam: string;
  onPlayerSelect: (value: string) => void;
  onTimeTeamChange: (value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime?: number;
  selectedFixtureData?: any;
}

const PlayerTimeTracker = ({
  trackedPlayers,
  selectedPlayer,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedTimeTeam,
  onPlayerSelect,
  onTimeTeamChange,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime = 0,
  selectedFixtureData
}: PlayerTimeTrackerProps) => {
  
  // Get filtered players based on selected team
  const getFilteredPlayers = () => {
    if (!selectedTimeTeam) return [];
    
    if (selectedTimeTeam === 'home' && homeTeamPlayers) {
      return homeTeamPlayers;
    } else if (selectedTimeTeam === 'away' && awayTeamPlayers) {
      return awayTeamPlayers;
    }
    
    return [];
  };

  const filteredPlayers = getFilteredPlayers();

  console.log('⏱️ PlayerTimeTracker Debug (Role-Based):');
  console.log('  - Selected team:', selectedTimeTeam);
  console.log('  - Filtered players count:', filteredPlayers.length);
  console.log('  - Home team players:', homeTeamPlayers?.length || 0);
  console.log('  - Away team players:', awayTeamPlayers?.length || 0);
  console.log('  - Tracked players:', trackedPlayers.length);
  console.log('  - Roles in filtered players:', [...new Set(filteredPlayers.map(p => p.role))]);
  
  debugPlayerDropdownData(filteredPlayers, "Player Time Tracker - Team Filtered (Role-Based)");

  const currentHalf = isSecondHalf(matchTime) ? 2 : 1;
  const halfProgress = getCurrentHalfTime(matchTime);
  const halfProgressPercent = Math.min((halfProgress / SEVEN_A_SIDE_CONSTANTS.HALF_DURATION) * 100, 100);

  // Clear player selection when team changes
  const handleTeamChange = (team: string) => {
    onTimeTeamChange(team);
    onPlayerSelect(""); // Clear player selection when team changes
  };

  return (
    <div className="space-y-6">
      {/* Enhanced 7-a-Side Validation Panel */}
      <SevenASideValidationPanel
        trackedPlayers={trackedPlayers}
        allPlayers={allPlayers}
        matchTime={matchTime}
        formatTime={formatTime}
      />

      <Card className="card-shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Player Time Tracker (7-a-Side Role-Based)
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
          {/* Add Player Section with Team Selection */}
          <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
            <h4 className="font-semibold text-sm">Add Player to Track</h4>
            
            {/* Team Selection */}
            <div className="space-y-2">
              <Label>Select Team</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={selectedTimeTeam === 'home' ? 'default' : 'outline'}
                  onClick={() => handleTeamChange('home')}
                  className="flex items-center gap-2 min-h-[44px]"
                  disabled={!selectedFixtureData}
                >
                  <HomeIcon className="h-4 w-4" />
                  {selectedFixtureData?.home_team?.name || 'Home Team'}
                </Button>
                <Button
                  type="button"
                  variant={selectedTimeTeam === 'away' ? 'default' : 'outline'}
                  onClick={() => handleTeamChange('away')}
                  className="flex items-center gap-2 min-h-[44px]"
                  disabled={!selectedFixtureData}
                >
                  <Users2 className="h-4 w-4" />
                  {selectedFixtureData?.away_team?.name || 'Away Team'}
                </Button>
              </div>
              {!selectedFixtureData && (
                <p className="text-xs text-red-500">
                  ⚠️ Please select a fixture first
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="playerSelect">Select Player</Label>
                <EnhancedRefereeSelect 
                  value={selectedPlayer} 
                  onValueChange={onPlayerSelect}
                  placeholder={
                    !selectedTimeTeam ? "Select a team first" :
                    filteredPlayers.length > 0 ? "Choose a player" : "No players available"
                  }
                  disabled={!selectedTimeTeam || filteredPlayers.length === 0}
                >
                  <EnhancedRefereeSelectContent>
                    {!selectedTimeTeam ? (
                      <EnhancedRefereeSelectItem value="no-team" disabled>
                        Please select a team first
                      </EnhancedRefereeSelectItem>
                    ) : filteredPlayers.length === 0 ? (
                      <EnhancedRefereeSelectItem value="no-players" disabled>
                        No players available for selected team
                      </EnhancedRefereeSelectItem>
                    ) : (
                      filteredPlayers.map((player) => (
                        <EnhancedRefereeSelectItem 
                          key={`time-player-${player.id}`}
                          value={player.id.toString()}
                          playerData={{
                            name: player.name,
                            team: player.team,
                            number: player.number || '?',
                            position: player.role // Use role instead of position for display
                          }}
                        >
                          {player.name}
                        </EnhancedRefereeSelectItem>
                      ))
                    )}
                  </EnhancedRefereeSelectContent>
                </EnhancedRefereeSelect>
                {selectedTimeTeam && filteredPlayers.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ No players found for {selectedTimeTeam} team
                  </p>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  onClick={onAddPlayer}
                  disabled={!selectedPlayer || !selectedTimeTeam || filteredPlayers.length === 0}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </div>
            </div>
          </div>

          {/* Tracked Players with Role Display */}
          {trackedPlayers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No players being tracked</p>
          ) : (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Tracked Players ({trackedPlayers.length})</h4>
              {trackedPlayers.map((player) => {
                const playerInfo = allPlayers.find(p => p.id === player.id);
                const role = playerInfo?.role || 'Starter'; // Use role field instead of position
                
                console.log('👤 Rendering tracked player:', {
                  name: player.name,
                  role,
                  playerInfo: !!playerInfo
                });
                
                return (
                  <div key={player.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {playerInfo?.number || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{player.name}</span>
                            <PlayerRoleBadge role={role} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground">{player.team}</p>
                          <Badge variant={player.isPlaying ? "default" : "secondary"} className="text-xs">
                            {player.isPlaying ? "ON FIELD" : "OFF FIELD"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono text-lg font-bold">
                            {formatTime(player.totalTime)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {role === 'S-class' && 'Max 20min/half'}
                            {role === 'Starter' && 'Min 10min total'}
                            {role === 'Captain' && 'No limits'}
                          </p>
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
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTimeTracker;
