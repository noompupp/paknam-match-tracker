
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fixture } from "@/types/database";

interface MatchTimerProps {
  selectedFixtureData: Fixture;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
}

const MatchTimer = ({ 
  selectedFixtureData, 
  homeScore, 
  awayScore, 
  matchTime, 
  isRunning, 
  formatTime 
}: MatchTimerProps) => {
  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Current Match</CardTitle>
        <p className="text-center text-muted-foreground">
          {new Date(selectedFixtureData.match_date).toLocaleDateString()} • {selectedFixtureData.match_time}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{selectedFixtureData.home_team?.name}</h3>
            <div className="text-4xl font-bold text-primary mt-2">{homeScore}</div>
          </div>
          <div className="mx-8">
            <div className="text-2xl font-bold mb-2">{formatTime(matchTime)}</div>
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "LIVE" : "PAUSED"}
            </Badge>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{selectedFixtureData.away_team?.name}</h3>
            <div className="text-4xl font-bold text-primary mt-2">{awayScore}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchTimer;
