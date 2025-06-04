
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Trophy } from "lucide-react";

interface MatchHeaderWithScoreProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  formatTime: (seconds: number) => string;
}

const MatchHeaderWithScore = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  formatTime
}: MatchHeaderWithScoreProps) => {
  const homeTeam = selectedFixtureData.home_team?.name || 'Home Team';
  const awayTeam = selectedFixtureData.away_team?.name || 'Away Team';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Match Summary
          </span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono">{formatTime(matchTime)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <h3 className="font-semibold text-lg">{homeTeam}</h3>
              <div className="text-3xl font-bold text-primary">{homeScore}</div>
            </div>
            <div className="text-2xl font-bold text-muted-foreground">-</div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{awayTeam}</h3>
              <div className="text-3xl font-bold text-primary">{awayScore}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchHeaderWithScore;
