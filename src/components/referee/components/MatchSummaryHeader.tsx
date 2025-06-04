
import { Badge } from "@/components/ui/badge";
import { Timer, Users } from "lucide-react";

interface MatchSummaryHeaderProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  trackedPlayers: any[];
  formatTime: (seconds: number) => string;
}

const MatchSummaryHeader = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  trackedPlayers,
  formatTime
}: MatchSummaryHeaderProps) => {
  const getResult = () => {
    if (homeScore > awayScore) return 'Home Win';
    if (awayScore > homeScore) return 'Away Win';
    return 'Draw';
  };

  const getResultColor = () => {
    if (homeScore > awayScore) return 'text-green-600';
    if (awayScore > homeScore) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-4">
        <div className="text-right">
          <p className="font-bold text-lg">{selectedFixtureData?.home_team?.name}</p>
          <p className="text-3xl font-bold">{homeScore}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">VS</p>
          <Badge variant="outline" className={getResultColor()}>
            {getResult()}
          </Badge>
        </div>
        <div className="text-left">
          <p className="font-bold text-lg">{selectedFixtureData?.away_team?.name}</p>
          <p className="text-3xl font-bold">{awayScore}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Timer className="h-4 w-4" />
          <span>Duration: {formatTime(matchTime)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{trackedPlayers.length} players tracked</span>
        </div>
      </div>
    </div>
  );
};

export default MatchSummaryHeader;
