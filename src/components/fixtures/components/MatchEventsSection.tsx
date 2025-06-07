
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";
import { getGoalAssistPlayerName } from "../utils/matchSummaryDataProcessor";

interface MatchEventsSectionProps {
  goals: any[];
  fixture: any;
  processedEvents: {
    homeGoals: any[];
    awayGoals: any[];
  };
  teamData: {
    homeTeamColor: string;
    awayTeamColor: string;
  };
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
}

const MatchEventsSection = ({
  goals,
  fixture,
  processedEvents,
  teamData,
  getGoalPlayerName,
  getGoalTime
}: MatchEventsSectionProps) => {
  const formatMinutes = (seconds: number) => {
    return Math.floor(seconds / 60);
  };

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <h4 className="font-bold flex items-center gap-3 mb-6 text-xl text-green-700">
          <Target className="h-6 w-6" />
          Match Events ({goals.length})
        </h4>
        
        {goals.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-dashed border-slate-200">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-500">No goals recorded in this match</p>
            <p className="text-sm text-slate-400">Goals and assists will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const isHomeGoal = processedEvents.homeGoals.includes(goal);
              const teamLogo = isHomeGoal ? fixture.home_team?.logoURL : fixture.away_team?.logoURL;
              const teamName = isHomeGoal ? fixture.home_team?.name : fixture.away_team?.name;
              const teamColor = isHomeGoal ? teamData.homeTeamColor : teamData.awayTeamColor;
              const playerName = getGoalPlayerName(goal);
              const assistName = getGoalAssistPlayerName(goal);
              const time = getGoalTime(goal);
              
              return (
                <div 
                  key={`goal-${goal.id}-${index}`} 
                  className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <TeamLogoDisplay 
                    teamName={teamName}
                    teamLogo={teamLogo}
                    teamColor={teamColor}
                    size="md"
                    showName={false}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-3xl">⚽</span>
                      <div className="font-bold text-xl text-green-800">
                        {playerName}
                      </div>
                      <Badge 
                        variant="outline" 
                        className="bg-green-600 text-white border-green-600 font-bold text-lg px-4 py-2"
                      >
                        {formatMinutes(time)}'
                      </Badge>
                    </div>
                    
                    {assistName && (
                      <div className="text-base text-green-700 ml-10 flex items-center gap-3">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-medium">
                          ASSIST
                        </Badge>
                        <span className="font-semibold">{assistName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchEventsSection;
