
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Wifi } from "lucide-react";
import { useMatchStore } from "@/stores/useMatchStore";

interface LiveScoreHeaderProps {
  homeTeamName: string;
  awayTeamName: string;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
}

const LiveScoreHeader = ({
  homeTeamName,
  awayTeamName,
  matchTime,
  isRunning,
  formatTime
}: LiveScoreHeaderProps) => {
  // Use global store for scores
  const { homeScore, awayScore, hasUnsavedChanges } = useMatchStore();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h3 className="text-lg font-semibold mb-2">{homeTeamName}</h3>
            <div className="text-6xl font-bold text-primary">{homeScore}</div>
          </div>
          
          <div className="text-center px-6">
            <div className="text-2xl font-bold text-muted-foreground mb-2">VS</div>
            <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{formatTime(matchTime)}</span>
            </div>
            <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
              isRunning ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {isRunning ? '● LIVE' : '⏸ PAUSED'}
            </div>
            {/* Global state indicator */}
            <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Global State</span>
              {hasUnsavedChanges && <span className="text-orange-500">• Pending</span>}
            </div>
          </div>
          
          <div className="text-center flex-1">
            <h3 className="text-lg font-semibold mb-2">{awayTeamName}</h3>
            <div className="text-6xl font-bold text-primary">{awayScore}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveScoreHeader;
