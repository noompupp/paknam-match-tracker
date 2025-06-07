
import { Badge } from "@/components/ui/badge";
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "../utils/matchSummaryDataProcessor";

interface GoalDisplayProps {
  goal: any;
  index: number;
  teamType: 'home' | 'away';
  teamColor: string;
}

const GoalDisplay = ({ goal, index, teamType, teamColor }: GoalDisplayProps) => {
  const formatMatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  try {
    const playerName = getGoalPlayerName(goal);
    const assistPlayerName = getGoalAssistPlayerName(goal);
    const goalTime = getGoalTime(goal);
    const goalId = goal.id || `${teamType}-goal-${index}`;

    console.log(`⚽ GoalDisplay: Premier League style rendering ${teamType} goal:`, {
      goalId,
      player: playerName,
      assist: assistPlayerName,
      time: goalTime,
      teamColor
    });

    if (!playerName) {
      console.warn(`⚠️ GoalDisplay: Missing player name for ${teamType} goal:`, goal);
      
      const fallbackName = goal.scorer || goal.name || `Unknown Player (Goal ${goalId})`;
      
      if (!fallbackName || fallbackName.includes('Unknown')) {
        console.error(`❌ GoalDisplay: Unable to extract player name for goal:`, goal);
        return (
          <div key={goalId} className={teamType === 'home' ? "text-left" : "text-right"}>
            <div className="text-sm text-muted-foreground italic bg-slate-50 p-3 rounded-lg">
              Goal recorded but player name unavailable (ID: {goalId})
            </div>
          </div>
        );
      }
    }

    const displayName = playerName || goal.scorer || goal.name || `Goal ${goalId}`;
    const displayTime = goalTime || goal.minute || 0;

    const getTeamGradient = () => {
      return {
        background: `linear-gradient(135deg, ${teamColor}15, ${teamColor}08, ${teamColor}05)`,
        borderLeft: teamType === 'home' ? `4px solid ${teamColor}` : 'none',
        borderRight: teamType === 'away' ? `4px solid ${teamColor}` : 'none'
      };
    };

    return (
      <div key={goalId} className={`${teamType === 'home' ? "text-left" : "text-right"} mb-4`}>
        <div 
          className={`p-4 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
            teamType === 'away' ? 'ml-8' : 'mr-8'
          }`}
          style={getTeamGradient()}
        >
          <div className={`flex items-center gap-4 ${teamType === 'away' ? 'justify-end' : ''}`}>
            {teamType === 'home' && (
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-md border-2 border-white"
                  style={{ backgroundColor: teamColor }}
                />
                <div className="bg-white rounded-full p-1 shadow-sm">
                  <div className="text-xs font-bold px-2 py-1" style={{ color: teamColor }}>⚽</div>
                </div>
              </div>
            )}
            
            <div className={`flex-1 ${teamType === 'away' ? 'text-right' : ''}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-lg text-slate-800">{displayName}</span>
                <Badge 
                  variant="outline" 
                  className="text-sm font-bold border-2 shadow-sm"
                  style={{ 
                    borderColor: teamColor, 
                    color: teamColor,
                    background: `${teamColor}10`
                  }}
                >
                  {formatMatchTime(displayTime)}
                </Badge>
              </div>

              {/* Premier League Style Assist Display */}
              {assistPlayerName && (
                <div className={`text-sm mt-2 ${teamType === 'away' ? 'text-right' : ''}`}>
                  <div className="inline-flex items-center gap-2 bg-white/70 px-3 py-1 rounded-full shadow-sm">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm"
                      style={{ backgroundColor: teamColor }}
                    >
                      A
                    </div>
                    <span className="font-semibold text-slate-700">{assistPlayerName}</span>
                  </div>
                </div>
              )}
            </div>

            {teamType === 'away' && (
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-1 shadow-sm">
                  <div className="text-xs font-bold px-2 py-1" style={{ color: teamColor }}>⚽</div>
                </div>
                <div 
                  className="w-4 h-4 rounded-full shadow-md border-2 border-white"
                  style={{ backgroundColor: teamColor }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`❌ GoalDisplay: Error rendering ${teamType} goal:`, { 
      error: error.message,
      stack: error.stack,
      goal,
      index 
    });
    return (
      <div key={`error-${teamType}-${index}`} className="text-sm text-destructive bg-red-50 p-3 rounded-lg border border-red-200">
        Error displaying goal (ID: {goal?.id || index})
      </div>
    );
  }
};

export default GoalDisplay;
