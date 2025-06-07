
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import TeamLogoDisplay from "../../TeamLogoDisplay";
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "../../utils/matchSummaryDataProcessor";

interface IPhoneStoryGoalsProps {
  goals: any[];
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
}

const IPhoneStoryGoals = ({ goals, homeGoals, awayGoals, homeTeamColor, awayTeamColor }: IPhoneStoryGoalsProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  if (goals.length === 0) return null;

  return (
    <div className="px-4 py-4 bg-green-25 border-b border-green-100">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <Target className="h-3 w-3 text-white" />
        </div>
        <h3 className="font-semibold text-sm text-green-800 text-center">
          Match Events ({goals.length})
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
              className="flex items-start gap-3 p-3 bg-white rounded border border-green-200"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: teamColor }}
                >
                  <span className="text-xs text-white">⚽</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-green-800 truncate">
                    {playerName}
                  </span>
                  <Badge variant="outline" className="text-xs bg-green-600 text-white border-green-600 ml-2 flex-shrink-0">
                    {formatTime(time)}
                  </Badge>
                </div>
                
                {assistName && (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-1 py-0">
                      A
                    </Badge>
                    <span className="truncate">{assistName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IPhoneStoryGoals;
