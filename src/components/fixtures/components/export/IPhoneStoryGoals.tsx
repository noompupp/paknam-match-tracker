
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "../../utils/matchSummaryDataProcessor";

interface IPhoneStoryGoalsProps {
  goals: any[];
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
}

const IPhoneStoryGoals = ({
  goals,
  homeGoals,
  awayGoals,
  homeTeamColor,
  awayTeamColor
}: IPhoneStoryGoalsProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  if (goals.length === 0) return null;

  return (
    <div className="px-4 py-4 bg-white">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">⚽</span>
        </div>
        <h3 className="font-bold text-base text-slate-800 text-center">
          Goals ({goals.length})
        </h3>
      </div>
      
      <div className="space-y-3">
        {goals.map((goal, index) => {
          const isHomeGoal = homeGoals.includes(goal);
          const teamColor = isHomeGoal ? homeTeamColor : awayTeamColor;
          const playerName = getGoalPlayerName(goal);
          const assistName = getGoalAssistPlayerName(goal);
          const time = getGoalTime(goal);
          
          return (
            <div 
              key={`goal-${goal.id}-${index}`} 
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: teamColor }}
                />
                <div className="flex-1 min-w-0 text-center">
                  <div className="text-sm font-semibold text-slate-800 truncate">
                    {playerName}
                  </div>
                  {assistName && (
                    <div className="text-xs text-slate-500 truncate">
                      Assist: {assistName}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm font-mono text-slate-600 bg-white px-2 py-1 rounded border ml-2">
                {formatTime(time)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IPhoneStoryGoals;
