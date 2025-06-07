
import { Card, CardContent } from "@/components/ui/card";
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "./utils/matchSummaryDataProcessor";
import GoalsSectionHeader from "./components/GoalsSectionHeader";
import GoalsList from "./components/GoalsList";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
      <CardContent className={`${isMobile ? 'pt-4' : 'pt-6'}`}>
        <GoalsSectionHeader totalGoals={goals.length} />
        
        <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex justify-between items-start'}`}>
          {/* Home Team Goals */}
          <div className={`${isMobile ? 'w-full' : 'flex-1 pr-6'}`}>
            <GoalsList
              goals={homeGoals}
              teamType="home"
              teamColor={homeTeamColor}
            />
          </div>

          {/* Enhanced Center Divider - Mobile Responsive */}
          {!isMobile && (
            <div className="px-6">
              <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 min-h-[80px] rounded-full"></div>
            </div>
          )}

          {/* Mobile Divider */}
          {isMobile && homeGoals.length > 0 && awayGoals.length > 0 && (
            <div className="w-full px-4">
              <div className="h-0.5 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 rounded-full"></div>
            </div>
          )}

          {/* Away Team Goals */}
          <div className={`${isMobile ? 'w-full' : 'flex-1 pl-6'}`}>
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
