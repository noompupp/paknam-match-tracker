
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
  console.log('⚽ GoalsSection: Enhanced mobile-first goals display:', {
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
      time: getGoalTime(g)
    }))
  });

  if (goals.length === 0) {
    console.log('⚽ GoalsSection: No goals to display');
    return null;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="pt-3 md:pt-6 px-3 md:px-6 pb-3 md:pb-6">
        <GoalsSectionHeader totalGoals={goals.length} />
        
        {/* Mobile-First Layout */}
        <div className="space-y-4 md:space-y-0">
          {/* Mobile Layout - Stacked with clear team separation */}
          <div className="block md:hidden space-y-4">
            {/* Home Team Goals */}
            {homeGoals.length > 0 && (
              <div className="space-y-2">
                <div 
                  className="text-sm font-bold px-3 py-1 rounded-md text-center"
                  style={{ 
                    backgroundColor: homeTeamColor + '15',
                    color: homeTeamColor,
                    border: `1px solid ${homeTeamColor}30`
                  }}
                >
                  Home Goals ({homeGoals.length})
                </div>
                <GoalsList
                  goals={homeGoals}
                  teamType="home"
                  teamColor={homeTeamColor}
                />
              </div>
            )}

            {/* Away Team Goals */}
            {awayGoals.length > 0 && (
              <div className="space-y-2">
                <div 
                  className="text-sm font-bold px-3 py-1 rounded-md text-center"
                  style={{ 
                    backgroundColor: awayTeamColor + '15',
                    color: awayTeamColor,
                    border: `1px solid ${awayTeamColor}30`
                  }}
                >
                  Away Goals ({awayGoals.length})
                </div>
                <GoalsList
                  goals={awayGoals}
                  teamType="away"
                  teamColor={awayTeamColor}
                />
              </div>
            )}
          </div>

          {/* Desktop Layout - Side by side */}
          <div className="hidden md:flex md:justify-between md:items-start gap-6">
            {/* Home Team Goals */}
            <div className="flex-1">
              <GoalsList
                goals={homeGoals}
                teamType="home"
                teamColor={homeTeamColor}
              />
            </div>

            {/* Center Divider */}
            <div className="px-3">
              <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 min-h-[60px] rounded-full"></div>
            </div>

            {/* Away Team Goals */}
            <div className="flex-1">
              <GoalsList
                goals={awayGoals}
                teamType="away"
                teamColor={awayTeamColor}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsSection;
