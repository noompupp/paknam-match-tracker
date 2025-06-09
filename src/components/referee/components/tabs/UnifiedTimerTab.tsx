
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, RotateCcw, Timer, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import EnhancedPlayerTimeTracker from "../playerTimeTracker/EnhancedPlayerTimeTracker";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface UnifiedTimerTabProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  trackedPlayers: PlayerTime[];
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onAddPlayer: (player: ProcessedPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
}

const UnifiedTimerTab = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  isRunning,
  formatTime,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  trackedPlayers,
  onToggleTimer,
  onResetMatch,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime
}: UnifiedTimerTabProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Match Timer Section */}
      <Card className="card-shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Timer className="h-5 w-5" />
            Match Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Match Info */}
          {selectedFixtureData && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {new Date(selectedFixtureData.match_date).toLocaleDateString()} • {selectedFixtureData.match_time}
              </p>
              <div className="text-xs text-muted-foreground">
                {selectedFixtureData.home_team?.name} vs {selectedFixtureData.away_team?.name}
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-4">
              {selectedFixtureData && (
                <>
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      {selectedFixtureData.home_team?.name || 'Home'}
                    </div>
                    <div className="text-2xl font-bold text-primary">{homeScore}</div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-3xl font-bold mb-1">{formatTime(matchTime)}</div>
                    <Badge variant={isRunning ? "default" : "secondary"} className="text-xs">
                      {isRunning ? "LIVE" : "PAUSED"}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      {selectedFixtureData.away_team?.name || 'Away'}
                    </div>
                    <div className="text-2xl font-bold text-primary">{awayScore}</div>
                  </div>
                </>
              )}
              
              {!selectedFixtureData && (
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{formatTime(matchTime)}</div>
                  <Badge variant={isRunning ? "default" : "secondary"}>
                    {isRunning ? "LIVE" : "PAUSED"}
                  </Badge>
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'justify-center'}`}>
              <Button
                onClick={onToggleTimer}
                className={`${isMobile ? 'w-full' : ''} flex items-center gap-2`}
                size={isMobile ? "lg" : "default"}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? "Pause Timer" : "Start Timer"}
              </Button>
              
              <Button
                onClick={onResetMatch}
                variant="outline"
                className={`${isMobile ? 'w-full' : ''} flex items-center gap-2`}
                size={isMobile ? "lg" : "default"}
              >
                <RotateCcw className="h-4 w-4" />
                Reset Match
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Separator */}
      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background px-3 text-sm text-muted-foreground font-medium">
            Player Time Tracking
          </div>
        </div>
      </div>

      {/* Player Time Tracking Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Player Time Tracking</h3>
        </div>
        
        <EnhancedPlayerTimeTracker
          trackedPlayers={trackedPlayers}
          allPlayers={allPlayers}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onTogglePlayerTime={onTogglePlayerTime}
          formatTime={formatTime}
          matchTime={matchTime}
          selectedFixtureData={selectedFixtureData}
        />
      </div>
    </div>
  );
};

export default UnifiedTimerTab;
