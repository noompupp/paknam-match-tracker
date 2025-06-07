
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { filterGoalsByTeam, getGoalPlayerName, getGoalTime, getGoalAssistPlayerName, normalizeTeamId } from "./utils/matchSummaryDataProcessor";

interface GoalsSectionProps {
  goals: any[];
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
}

const GoalsSection = ({
  goals,
  homeGoals,
  awayGoals,
  homeTeamColor,
  awayTeamColor,
  getGoalPlayerName,
  getGoalTime
}: GoalsSectionProps) => {
  const formatMatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  console.log('⚽ GoalsSection: Enhanced debugging with assist information:', {
    totalGoals: goals.length,
    homeGoals: homeGoals.length,
    awayGoals: awayGoals.length,
    goalStructureAnalysis: goals.map(g => ({
      id: g.id,
      type: g.type,
      playerName: getGoalPlayerName(g),
      assistPlayerName: getGoalAssistPlayerName(g),
      time: getGoalTime(g),
      teamId: g.teamId,
      team_id: g.team_id,
      team: g.team,
      teamName: g.teamName,
      rawStructure: g
    })),
    homeGoalsWithAssists: homeGoals.map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      assist: getGoalAssistPlayerName(g),
      time: getGoalTime(g)
    })),
    awayGoalsWithAssists: awayGoals.map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      assist: getGoalAssistPlayerName(g),
      time: getGoalTime(g)
    }))
  });

  if (goals.length === 0) {
    console.log('⚽ GoalsSection: No goals to display');
    return null;
  }

  // Enhanced goal rendering with assist information
  const renderGoal = (goal: any, index: number, teamType: 'home' | 'away') => {
    try {
      const playerName = getGoalPlayerName(goal);
      const assistPlayerName = getGoalAssistPlayerName(goal);
      const goalTime = getGoalTime(goal);
      const goalId = goal.id || `${teamType}-goal-${index}`;

      console.log(`⚽ GoalsSection: Enhanced rendering ${teamType} goal with assist:`, {
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
        console.warn(`⚠️ GoalsSection: Missing player name for ${teamType} goal - attempting fallback:`, {
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
          console.error(`❌ GoalsSection: Unable to extract player name for goal:`, goal);
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
                style={{ backgroundColor: homeTeamColor }}
              />
            )}
            
            <span className="font-semibold text-base">{displayName}</span>
            
            <Badge variant="outline" className="text-sm font-medium">
              {formatMatchTime(displayTime)}
            </Badge>

            {teamType === 'away' && (
              <div 
                className="w-3 h-3 rounded-full shadow-md"
                style={{ backgroundColor: awayTeamColor }}
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
      console.error(`❌ GoalsSection: Error rendering ${teamType} goal:`, { 
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

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Goals ({goals.length})
        </h3>
        
        <div className="flex justify-between items-start">
          {/* Home Team Goals */}
          <div className="flex-1 pr-6">
            <div className="space-y-4">
              {homeGoals.length > 0 ? (
                homeGoals.map((goal, index) => renderGoal(goal, index, 'home'))
              ) : (
                <div className="text-sm text-muted-foreground italic text-center py-4">
                  No goals scored
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Center Divider */}
          <div className="px-6">
            <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 min-h-[80px] rounded-full"></div>
          </div>

          {/* Away Team Goals */}
          <div className="flex-1 pl-6">
            <div className="space-y-4">
              {awayGoals.length > 0 ? (
                awayGoals.map((goal, index) => renderGoal(goal, index, 'away'))
              ) : (
                <div className="text-sm text-muted-foreground italic text-center py-4">
                  No goals scored
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsSection;
