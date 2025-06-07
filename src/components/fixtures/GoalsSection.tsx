
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
  console.log('⚽ GoalsSection: Comprehensive assist information analysis with enhanced debugging:', {
    totalGoals: goals.length,
    homeGoals: homeGoals.length,
    awayGoals: awayGoals.length,
    totalGoalsWithAssists: goals.filter(g => getGoalAssistPlayerName(g)).length,
    comprehensiveAssistAnalysis: goals.map(g => ({
      id: g.id,
      type: g.type,
      playerName: getGoalPlayerName(g),
      assistPlayerName: getGoalAssistPlayerName(g),
      hasAssist: !!getGoalAssistPlayerName(g),
      time: getGoalTime(g),
      rawAssistFields: {
        assistPlayerName: g.assistPlayerName,
        assist_player_name: g.assist_player_name,
        assistTeamId: g.assistTeamId,
        assist_team_id: g.assist_team_id,
        assistName: g.assistName,
        assist_name: g.assist_name
      },
      extractorResult: getGoalAssistPlayerName(g)
    })),
    homeGoalsWithAssistDetails: homeGoals.map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      assist: getGoalAssistPlayerName(g),
      hasAssist: !!getGoalAssistPlayerName(g),
      time: getGoalTime(g),
      rawData: {
        assistPlayerName: g.assistPlayerName,
        assist_player_name: g.assist_player_name
      }
    })),
    awayGoalsWithAssistDetails: awayGoals.map(g => ({
      id: g.id,
      player: getGoalPlayerName(g),
      assist: getGoalAssistPlayerName(g),
      hasAssist: !!getGoalAssistPlayerName(g),
      time: getGoalTime(g),
      rawData: {
        assistPlayerName: g.assistPlayerName,
        assist_player_name: g.assist_player_name
      }
    })),
    assistCorrelationSummary: {
      totalGoalsWithRawAssistData: goals.filter(g => g.assistPlayerName || g.assist_player_name).length,
      totalGoalsWithExtractedAssists: goals.filter(g => getGoalAssistPlayerName(g)).length,
      homeGoalsWithAssists: homeGoals.filter(g => getGoalAssistPlayerName(g)).length,
      awayGoalsWithAssists: awayGoals.filter(g => getGoalAssistPlayerName(g)).length
    }
  });

  if (goals.length === 0) {
    console.log('⚽ GoalsSection: No goals to display');
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
        <GoalsSectionHeader totalGoals={goals.length} />
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
          {/* Home Team Goals */}
          <div className="flex-1 md:pr-6">
            <GoalsList
              goals={homeGoals}
              teamType="home"
              teamColor={homeTeamColor}
            />
          </div>

          {/* Enhanced Center Divider - Hidden on mobile */}
          <div className="hidden md:block px-6">
            <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 min-h-[80px] rounded-full"></div>
          </div>

          {/* Away Team Goals */}
          <div className="flex-1 md:pl-6">
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
