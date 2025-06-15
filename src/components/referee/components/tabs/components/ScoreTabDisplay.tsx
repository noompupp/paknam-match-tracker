
import { Crown, Clock } from "lucide-react";
import RefereeCard from "../../../shared/RefereeCard";
import { cn } from "@/lib/utils";
import { useMatchStore } from "@/stores/useMatchStore";

interface ScoreTabDisplayProps {
  homeTeamName: string;
  awayTeamName: string;
  matchTime: number;
  isRunning: boolean;
  hasUnsavedChanges?: boolean;
  formatTime: (seconds: number) => string;
}

const ScoreTabDisplay = ({
  homeTeamName,
  awayTeamName,
  matchTime,
  isRunning,
  hasUnsavedChanges = false,
  formatTime
}: ScoreTabDisplayProps) => {
  // 🟢 Get live score from store!
  const { homeScore, awayScore } = useMatchStore();

  const isHomeWinning = homeScore > awayScore;
  const isAwayWinning = awayScore > homeScore;
  const isDraw = homeScore === awayScore;

  return (
    <RefereeCard
      variant="highlighted"
      className="referee-score-display"
      icon={<Crown className="h-5 w-5" />}
      title={null}
      headerActions={
        <div className="flex items-center gap-2">
          <div className={cn(
            "referee-status-indicator",
            isRunning ? "referee-status-running" : "referee-status-paused"
          )}>
            <Clock className="h-3 w-3" />
            {formatTime(matchTime)}
          </div>
          {hasUnsavedChanges && (
            <div className="referee-status-indicator bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
              Unsaved
            </div>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Home Team */}
        <div className="text-center">
          <div className={cn(
            "transition-all duration-300",
            isHomeWinning && "scale-110"
          )}>
            <div className="text-3xl font-bold mb-2 referee-timer">
              {homeScore}
            </div>
            <div className={cn(
              "text-sm font-medium px-3 py-1 rounded-full",
              isHomeWinning ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
              isDraw ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" :
              "bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400"
            )}>
              {homeTeamName}
            </div>
          </div>
        </div>
        {/* VS Separator */}
        <div className="text-center">
          <div className="text-lg font-bold text-muted-foreground">
            VS
          </div>
        </div>
        {/* Away Team */}
        <div className="text-center">
          <div className={cn(
            "transition-all duration-300",
            isAwayWinning && "scale-110"
          )}>
            <div className="text-3xl font-bold mb-2 referee-timer">
              {awayScore}
            </div>
            <div className={cn(
              "text-sm font-medium px-3 py-1 rounded-full",
              isAwayWinning ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
              isDraw ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" :
              "bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400"
            )}>
              {awayTeamName}
            </div>
          </div>
        </div>
      </div>
    </RefereeCard>
  );
};

export default ScoreTabDisplay;

