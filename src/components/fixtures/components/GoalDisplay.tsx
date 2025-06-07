
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

    console.log(`⚽ GoalDisplay: Enhanced rendering ${teamType} goal with assist:`, {
      goalId,
      player: playerName,
      assist: assistPlayerName,
      time: goalTime,
      teamData: {
        teamId: goal.teamId,
        team_id: goal.team_id,
        team: goal.team,
        teamName: goal.teamName
      },
      fullGoalStructure: goal,
      hasPlayerName: !!playerName,
      hasAssist: !!assistPlayerName,
      hasTime: !!goalTime
    });

    if (!playerName) {
      console.warn(`⚠️ GoalDisplay: Missing player name for ${teamType} goal - attempting fallback:`, {
        goal,
        fallbackAttempts: {
          playerName: goal.playerName,
          player_name: goal.player_name,
          player: goal.player,
          scorer: goal.scorer,
          name: goal.name
        }
      });
      
      const fallbackName = goal.scorer || goal.name || `Unknown Player (Goal ${goalId})`;
      
      if (!fallbackName || fallbackName.includes('Unknown')) {
        console.error(`❌ GoalDisplay: Unable to extract player name for goal:`, goal);
        return (
          <div key={goalId} className={teamType === 'home' ? "text-left" : "text-right"}>
            <div className="text-sm text-muted-foreground italic">
              Goal recorded but player name unavailable (ID: {goalId})
            </div>
          </div>
        );
      }
    }

    const displayName = playerName || goal.scorer || goal.name || `Goal ${goalId}`;
    const displayTime = goalTime || goal.minute || 0;

    return (
      <div key={goalId} className={teamType === 'home' ? "text-left" : "text-right"}>
        <div className={`flex items-center gap-3 ${teamType === 'away' ? 'justify-end' : ''}`}>
          {teamType === 'home' && (
            <div 
              className="w-3 h-3 rounded-full shadow-md"
              style={{ backgroundColor: teamColor }}
            />
          )}
          
          <span className="font-semibold text-base">{displayName}</span>
          
          <Badge variant="outline" className="text-sm font-medium">
            {formatMatchTime(displayTime)}
          </Badge>

          {teamType === 'away' && (
            <div 
              className="w-3 h-3 rounded-full shadow-md"
              style={{ backgroundColor: teamColor }}
            />
          )}
        </div>
        
        {/* Premier League Style Assist Display */}
        {assistPlayerName && (
          <div className={`text-sm text-muted-foreground mt-1 font-medium ${teamType === 'away' ? 'text-right mr-6' : 'ml-6'}`}>
            🅰️ Assist: {assistPlayerName}
          </div>
        )}
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
      <div key={`error-${teamType}-${index}`} className="text-sm text-destructive">
        Error displaying goal (ID: {goal?.id || index})
      </div>
    );
  }
};

export default GoalDisplay;
