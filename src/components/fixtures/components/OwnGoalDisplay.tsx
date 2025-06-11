
import { Badge } from "@/components/ui/badge";
import { separateOwnGoalsFromRegular, getOwnGoalPlayerName, getOwnGoalTime } from "../utils/ownGoalDataProcessor";

interface OwnGoalDisplayProps {
  goals: any[];
  homeTeamId: string;
  awayTeamId: string;
  formatTime: (seconds: number) => string;
}

const OwnGoalDisplay = ({
  goals,
  homeTeamId,
  awayTeamId,
  formatTime
}: OwnGoalDisplayProps) => {
  const { ownGoals } = separateOwnGoalsFromRegular(goals);

  if (ownGoals.length === 0) {
    return null;
  }

  const homeOwnGoals = ownGoals.filter(goal => goal.teamId === homeTeamId);
  const awayOwnGoals = ownGoals.filter(goal => goal.teamId === awayTeamId);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        🥅 Own Goals ({ownGoals.length})
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Home Team Own Goals */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Home Team</div>
          {homeOwnGoals.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">No own goals</div>
          ) : (
            <div className="space-y-1">
              {homeOwnGoals.map((goal, index) => (
                <div key={goal.id || index} className="flex items-center justify-between bg-red-50 dark:bg-red-900/10 p-2 rounded border-l-2 border-red-400">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    {getOwnGoalPlayerName(goal)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      Own Goal
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(getOwnGoalTime(goal))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Away Team Own Goals */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Away Team</div>
          {awayOwnGoals.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">No own goals</div>
          ) : (
            <div className="space-y-1">
              {awayOwnGoals.map((goal, index) => (
                <div key={goal.id || index} className="flex items-center justify-between bg-red-50 dark:bg-red-900/10 p-2 rounded border-l-2 border-red-400">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    {getOwnGoalPlayerName(goal)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      Own Goal
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(getOwnGoalTime(goal))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnGoalDisplay;
