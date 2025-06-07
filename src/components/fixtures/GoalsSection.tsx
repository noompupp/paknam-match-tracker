
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { filterGoalsByTeam, getGoalPlayerName, getGoalTime, normalizeTeamId } from "./utils/matchSummaryDataProcessor";

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

  console.log('⚽ GoalsSection: Received props:', {
    totalGoals: goals.length,
    homeGoals: homeGoals.length,
    awayGoals: awayGoals.length,
    homeGoalsData: homeGoals.map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      time: getGoalTime(g),
      teamId: g.teamId || g.team_id || g.team
    })),
    awayGoalsData: awayGoals.map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      time: getGoalTime(g),
      teamId: g.teamId || g.team_id || g.team
    }))
  });

  if (goals.length === 0) {
    console.log('⚽ GoalsSection: No goals to display');
    return null;
  }

  // Enhanced goal rendering with error handling
  const renderGoal = (goal: any, index: number, teamType: 'home' | 'away') => {
    try {
      const playerName = getGoalPlayerName(goal);
      const goalTime = getGoalTime(goal);
      const goalId = goal.id || `${teamType}-goal-${index}`;

      console.log(`⚽ GoalsSection: Rendering ${teamType} goal:`, {
        goalId,
        player: playerName,
        time: goalTime,
        teamId: goal.teamId || goal.team_id || goal.team,
        fullGoalData: goal
      });

      if (!playerName) {
        console.warn(`⚠️ GoalsSection: Missing player name for ${teamType} goal:`, goal);
        return null;
      }

      return (
        <div key={goalId} className={teamType === 'home' ? "text-left" : "text-right"}>
          <div className={`flex items-center gap-3 ${teamType === 'away' ? 'justify-end' : ''}`}>
            {teamType === 'home' && (
              <div 
                className="w-3 h-3 rounded-full shadow-md"
                style={{ backgroundColor: homeTeamColor }}
              />
            )}
            
            <span className="font-semibold text-base">{playerName}</span>
            
            <Badge variant="outline" className="text-sm font-medium">
              {formatMatchTime(goalTime)}
            </Badge>

            {teamType === 'away' && (
              <div 
                className="w-3 h-3 rounded-full shadow-md"
                style={{ backgroundColor: awayTeamColor }}
              />
            )}
          </div>
          {goal.assistPlayerName && (
            <div className={`text-sm text-muted-foreground mt-2 font-medium ${teamType === 'away' ? 'mr-6' : 'ml-6'}`}>
              🅰️ Assist: {goal.assistPlayerName}
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error(`❌ GoalsSection: Error rendering ${teamType} goal:`, { error, goal });
      return null;
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
