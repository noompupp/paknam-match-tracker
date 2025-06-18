
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Timer, Users, Play, Pause, UserMinus } from "lucide-react";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useTranslation } from "@/hooks/useTranslation";

interface SimplePlayerTimeTrackerProps {
  trackedPlayers: PlayerTime[];
  selectedPlayer: string;
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  selectedTimeTeam: string;
  onPlayerSelect: (value: string) => void;
  onTimeTeamChange: (value: string) => void;
  onAddPlayer: (player: ProcessedPlayer) => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime?: number;
  selectedFixtureData?: any;
}

const SimplePlayerTimeTracker = ({
  trackedPlayers,
  selectedPlayer,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedTimeTeam,
  onPlayerSelect,
  onTimeTeamChange,
  onAddPlayer,
  onTogglePlayerTime,
  formatTime,
  matchTime = 0,
  selectedFixtureData
}: SimplePlayerTimeTrackerProps) => {
  const { t } = useTranslation();

  console.log('⏱️ SimplePlayerTimeTracker (Restored Original):', {
    trackedCount: trackedPlayers.length,
    selectedPlayer,
    selectedTimeTeam,
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    allPlayersCount: allPlayers.length
  });

  const availablePlayers = selectedTimeTeam === 'home' 
    ? homeTeamPlayers || []
    : selectedTimeTeam === 'away' 
    ? awayTeamPlayers || []
    : allPlayers;

  const handleAddPlayer = () => {
    if (!selectedPlayer) return;
    
    const player = availablePlayers.find(p => p.id.toString() === selectedPlayer);
    if (player) {
      onAddPlayer(player);
      onPlayerSelect(""); // Clear selection after adding
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    // Remove player functionality - for now just log
    console.log('Remove player:', playerId);
  };

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <Card className="referee-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {t("referee.addPlayerToTrack", "Add Player to Track")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("referee.team", "Team")}</label>
              <Select value={selectedTimeTeam} onValueChange={onTimeTeamChange}>
                <SelectTrigger className="referee-select">
                  <SelectValue placeholder={t("referee.selectTeam", "Select team")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">
                    {selectedFixtureData?.home_team?.name || t("referee.homeTeam", "Home Team")}
                  </SelectItem>
                  <SelectItem value="away">
                    {selectedFixtureData?.away_team?.name || t("referee.awayTeam", "Away Team")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("referee.player", "Player")}</label>
              <Select value={selectedPlayer} onValueChange={onPlayerSelect}>
                <SelectTrigger className="referee-select">
                  <SelectValue placeholder={t("referee.selectPlayer", "Select player")} />
                </SelectTrigger>
                <SelectContent>
                  {availablePlayers.length === 0 ? (
                    <SelectItem value="no-players" disabled>
                      {t("referee.noPlayersAvailable", "No players available")}
                    </SelectItem>
                  ) : (
                    availablePlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name} ({player.team})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAddPlayer}
                disabled={!selectedPlayer || !selectedTimeTeam || availablePlayers.length === 0}
                className="w-full referee-button-primary"
              >
                <Users className="h-4 w-4 mr-2" />
                {t("referee.trackPlayer", "Track Player")}
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
            {t("referee.trackedPlayers", "Tracked Players")} ({trackedPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackedPlayers.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("referee.noPlayersTracked", "No players being tracked")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("referee.addPlayersAbove", "Add players above to start tracking their playing time")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trackedPlayers.map((player) => {
                const playerInfo = allPlayers.find(p => p.id === player.id);
                const currentPlayingTime = player.isPlaying && player.startTime !== null 
                  ? matchTime - player.startTime 
                  : 0;
                const totalTime = player.totalTime + currentPlayingTime;

                return (
                  <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                        {playerInfo?.number || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">{player.team}</p>
                      </div>
                      <Badge variant={player.isPlaying ? "default" : "secondary"}>
                        {player.isPlaying ? t("referee.playing", "Playing") : t("referee.benched", "Benched")}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {formatTime(totalTime)}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("referee.totalTime", "Total Time")}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTogglePlayerTime(player.id)}
                        >
                          {player.isPlaying ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemovePlayer(player.id)}
                        >
                          <UserMinus className="h-3 w-3" />
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
    </div>
  );
};

export default SimplePlayerTimeTracker;
