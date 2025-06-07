
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

  // Enhanced color fallback system
  const getEnhancedTeamColor = (color: string, fallback: string) => {
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white') {
      return fallback;
    }
    return color;
  };

  const enhancedHomeColor = getEnhancedTeamColor(teamData.homeTeamColor, '#1f2937');
  const enhancedAwayColor = getEnhancedTeamColor(teamData.awayTeamColor, '#7c3aed');

  return (
    <Card className="border-2 animate-fade-in">
      <CardContent className="pt-6">
        <h4 className="font-bold flex items-center gap-3 mb-6 text-xl text-green-700">
          <div className="p-2 rounded-full bg-green-100">
            <Target className="h-6 w-6" />
          </div>
          Match Events ({goals.length})
        </h4>
        
        {goals.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-dashed border-slate-200 animate-fade-in">
            <div className="animate-bounce mb-4">
              <Target className="h-12 w-12 text-slate-300 mx-auto" />
            </div>
            <p className="text-lg font-medium text-slate-500 mb-2">No goals recorded in this match</p>
            <p className="text-sm text-slate-400">Goals and assists will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const isHomeGoal = processedEvents.homeGoals.includes(goal);
              const teamLogo = isHomeGoal ? fixture.home_team?.logoURL : fixture.away_team?.logoURL;
              const teamName = isHomeGoal ? fixture.home_team?.name : fixture.away_team?.name;
              const teamColor = isHomeGoal ? enhancedHomeColor : enhancedAwayColor;
              const playerName = getGoalPlayerName(goal);
              const assistName = getGoalAssistPlayerName(goal);
              const time = getGoalTime(goal);
              
              return (
                <div 
                  key={`goal-${goal.id}-${index}`} 
                  className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in"
                  style={{
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  <div className="transition-transform duration-300 hover:scale-110">
                    <TeamLogoDisplay 
                      teamName={teamName}
                      teamLogo={teamLogo}
                      teamColor={teamColor}
                      size="md"
                      showName={false}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-3xl animate-pulse">⚽</span>
                      <div className="font-bold text-xl text-green-800 leading-tight">
                        {playerName}
                      </div>
                      <Badge 
                        variant="outline" 
                        className="bg-green-600 text-white border-green-600 font-bold text-lg px-4 py-2 transition-all duration-300 hover:bg-green-700 hover:scale-105"
                      >
                        {formatMinutes(time)}'
                      </Badge>
                    </div>
                    
                    {assistName && (
                      <div className="text-base text-green-700 ml-10 flex items-center gap-3 animate-fade-in">
                        <Badge 
                          variant="outline" 
                          className="bg-blue-100 text-blue-800 border-blue-300 font-medium transition-all duration-300 hover:bg-blue-200"
                        >
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
