
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useMatchStore } from "@/stores/useMatchStore";

interface GoalsTabScoreDisplayProps {
  homeTeamName: string;
  awayTeamName: string;
  matchTime: number;
  formatTime: (seconds: number) => string;
}

// Remove homeScore/awayScore from props, use store
const GoalsTabScoreDisplay = ({
  homeTeamName,
  awayTeamName,
  matchTime,
  formatTime
}: GoalsTabScoreDisplayProps) => {
  const { homeScore, awayScore } = useMatchStore();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h3 className="text-sm font-medium text-muted-foreground">{homeTeamName}</h3>
            <div className="text-3xl font-bold text-primary">{homeScore}</div>
          </div>
          <div className="text-center px-4">
            <div className="text-lg font-bold text-muted-foreground">VS</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatTime(matchTime)}</span>
            </div>
          </div>
          <div className="text-center flex-1">
            <h3 className="text-sm font-medium text-muted-foreground">{awayTeamName}</h3>
            <div className="text-3xl font-bold text-primary">{awayScore}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default GoalsTabScoreDisplay;
