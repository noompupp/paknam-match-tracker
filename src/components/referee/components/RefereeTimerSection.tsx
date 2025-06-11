
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

interface RefereeTimerSectionProps {
  matchTime: number;
  isRunning: boolean;
  homeScore: number;
  awayScore: number;
  formatTime: (seconds: number) => string;
  toggleTimer: () => void;
  resetTimer: () => void;
  selectedFixtureData: any;
}

const RefereeTimerSection = ({
  matchTime,
  isRunning,
  homeScore,
  awayScore,
  formatTime,
  toggleTimer,
  resetTimer,
  selectedFixtureData
}: RefereeTimerSectionProps) => {
  const homeTeam = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeam = selectedFixtureData?.away_team?.name || 'Away Team';

  return (
    <Card className="referee-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Match Header */}
          {selectedFixtureData && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                <span className="truncate">{homeTeam}</span>
                <span className="text-muted-foreground">vs</span>
                <span className="truncate">{awayTeam}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedFixtureData.match_date).toLocaleDateString()} • {selectedFixtureData.time || '18:00'}
              </p>
            </div>
          )}

          {/* Score and Timer Display */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold referee-score-display">
                {homeScore}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {homeTeam.substring(0, 10)}
              </p>
            </div>

            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="referee-time-display text-xl md:text-2xl">
                  {formatTime(matchTime)}
                </div>
              </div>
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "LIVE" : "PAUSED"}
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold referee-score-display">
                {awayScore}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {awayTeam.substring(0, 10)}
              </p>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={toggleTimer}
              variant="default"
              className="referee-button-primary"
            >
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className="referee-button-secondary"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefereeTimerSection;
