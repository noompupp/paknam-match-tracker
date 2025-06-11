
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface UnifiedMatchTimerProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  phase?: 'first' | 'second' | 'overtime';
}

const UnifiedMatchTimer = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  isRunning,
  formatTime,
  onToggleTimer,
  onResetMatch,
  phase = 'first'
}: UnifiedMatchTimerProps) => {
  const isMobile = useIsMobile();

  // Calculate phase time for 7-a-side (25 minutes per half)
  const HALF_DURATION = 25 * 60; // 25 minutes in seconds
  const currentPhaseTime = phase === 'second' && matchTime > HALF_DURATION 
    ? matchTime - HALF_DURATION 
    : matchTime;

  const getPhaseDisplay = () => {
    if (matchTime <= HALF_DURATION) return 'First Half';
    if (matchTime <= HALF_DURATION * 2) return 'Second Half';
    return 'Overtime';
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'first': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'second': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'overtime': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Card className="card-shadow-lg border-l-4 border-l-primary">
      <CardContent className="pt-4">
        {/* Match Info Header */}
        {selectedFixtureData && (
          <div className="text-center mb-3">
            <div className="text-sm text-muted-foreground mb-1">
              {new Date(selectedFixtureData.match_date).toLocaleDateString()} • {selectedFixtureData.match_time}
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedFixtureData.home_team?.name} vs {selectedFixtureData.away_team?.name}
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {selectedFixtureData ? (
            <>
              {/* Home Team */}
              <div className="text-center min-w-0 flex-1">
                <div className="text-sm font-medium text-muted-foreground truncate">
                  {selectedFixtureData.home_team?.name || 'Home'}
                </div>
                <div className="text-3xl font-bold text-primary">{homeScore}</div>
              </div>

              {/* Timer Center */}
              <div className="text-center px-4">
                <div className="flex flex-col items-center gap-2">
                  {/* Phase Indicator */}
                  <Badge className={cn("text-xs font-medium", getPhaseColor())}>
                    {getPhaseDisplay()}
                  </Badge>
                  
                  {/* Main Timer */}
                  <div className="text-4xl font-bold mb-1">{formatTime(matchTime)}</div>
                  
                  {/* Status Badge */}
                  <Badge variant={isRunning ? "default" : "secondary"} className="text-xs">
                    <Timer className="h-3 w-3 mr-1" />
                    {isRunning ? "LIVE" : "PAUSED"}
                  </Badge>
                </div>
              </div>

              {/* Away Team */}
              <div className="text-center min-w-0 flex-1">
                <div className="text-sm font-medium text-muted-foreground truncate">
                  {selectedFixtureData.away_team?.name || 'Away'}
                </div>
                <div className="text-3xl font-bold text-primary">{awayScore}</div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{formatTime(matchTime)}</div>
              <Badge variant={isRunning ? "default" : "secondary"}>
                <Timer className="h-3 w-3 mr-1" />
                {isRunning ? "LIVE" : "PAUSED"}
              </Badge>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={cn("flex gap-3", isMobile ? "flex-col" : "justify-center")}>
          <Button
            onClick={onToggleTimer}
            className={cn(
              isMobile ? "w-full" : "",
              "flex items-center gap-2"
            )}
            size={isMobile ? "lg" : "default"}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Pause Timer" : "Start Timer"}
          </Button>
          
          <Button
            onClick={onResetMatch}
            variant="outline"
            className={cn(
              isMobile ? "w-full" : "",
              "flex items-center gap-2"
            )}
            size={isMobile ? "lg" : "default"}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Match
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedMatchTimer;
