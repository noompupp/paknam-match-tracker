
import { Card, CardContent } from "@/components/ui/card";
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "./utils/matchSummaryDataProcessor";
import GoalsSectionHeader from "./components/GoalsSectionHeader";
import GoalsList from "./components/GoalsList";

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

  return (
    <Card>
      <CardContent className="pt-6">
        <GoalsSectionHeader totalGoals={goals.length} />
        
        <div className="flex justify-between items-start">
          {/* Home Team Goals */}
          <div className="flex-1 pr-6">
            <GoalsList
              goals={homeGoals}
              teamType="home"
              teamColor={homeTeamColor}
            />
          </div>

          {/* Enhanced Center Divider */}
          <div className="px-6">
            <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 min-h-[80px] rounded-full"></div>
          </div>

          {/* Away Team Goals */}
          <div className="flex-1 pl-6">
            <GoalsList
              goals={awayGoals}
              teamType="away"
              teamColor={awayTeamColor}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsSection;
