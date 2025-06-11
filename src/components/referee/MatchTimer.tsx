
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Fixture } from "@/types/database";

interface MatchTimerProps {
  selectedFixtureData?: Fixture;
  homeScore?: number;
  awayScore?: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  onToggleTimer?: () => void;
  onResetMatch?: () => void;
}

const MatchTimer = ({ 
  selectedFixtureData, 
  homeScore = 0, 
  awayScore = 0, 
  matchTime, 
  isRunning, 
  formatTime,
  onToggleTimer
}: MatchTimerProps) => {
  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-contrast">Match Timer</CardTitle>
        {selectedFixtureData && (
          <p className="text-center text-contrast-muted">
            {new Date(selectedFixtureData.match_date).toLocaleDateString()} • {selectedFixtureData.match_time}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-center">
          {selectedFixtureData && (
            <>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-contrast">{selectedFixtureData.home_team?.name}</h3>
                <div className="text-4xl font-bold text-primary mt-2">{homeScore}</div>
              </div>
              <div className="mx-8">
                <div className="text-2xl font-bold mb-2 time-display">{formatTime(matchTime)}</div>
                <Badge variant={isRunning ? "default" : "secondary"}>
                  {isRunning ? "LIVE" : "PAUSED"}
                </Badge>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-contrast">{selectedFixtureData.away_team?.name}</h3>
                <div className="text-4xl font-bold text-primary mt-2">{awayScore}</div>
              </div>
            </>
          )}
          
          {!selectedFixtureData && (
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold mb-2 time-display">{formatTime(matchTime)}</div>
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "LIVE" : "PAUSED"}
              </Badge>
            </div>
          )}
        </div>
        
        {onToggleTimer && (
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={onToggleTimer} variant="default" className="button-primary-enhanced">
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchTimer;
