
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface GoalsSectionProps {
  timelineGoals: any[];
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
}

const GoalsSection = ({
  timelineGoals,
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

  if (timelineGoals.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Goals ({timelineGoals.length})
        </h3>
        
        <div className="flex justify-between items-start">
          {/* Home Team Goals */}
          <div className="flex-1 pr-6">
            <div className="space-y-4">
              {homeGoals.map((goal, index) => (
                <div key={`home-goal-${goal.id}-${index}`} className="text-left">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shadow-md"
                      style={{ backgroundColor: homeTeamColor }}
                    />
                    <span className="font-semibold text-base">{getGoalPlayerName(goal)}</span>
                    <Badge variant="outline" className="text-sm font-medium">
                      {formatMatchTime(getGoalTime(goal))}
                    </Badge>
                  </div>
                  {goal.assistPlayerName && (
                    <div className="text-sm text-muted-foreground ml-6 mt-2 font-medium">
                      🅰️ Assist: {goal.assistPlayerName}
                    </div>
                  )}
                </div>
              ))}
              {homeGoals.length === 0 && (
                <div className="text-sm text-muted-foreground italic text-center py-4">No goals scored</div>
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
              {awayGoals.map((goal, index) => (
                <div key={`away-goal-${goal.id}-${index}`} className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Badge variant="outline" className="text-sm font-medium">
                      {formatMatchTime(getGoalTime(goal))}
                    </Badge>
                    <span className="font-semibold text-base">{getGoalPlayerName(goal)}</span>
                    <div 
                      className="w-3 h-3 rounded-full shadow-md"
                      style={{ backgroundColor: awayTeamColor }}
                    />
                  </div>
                  {goal.assistPlayerName && (
                    <div className="text-sm text-muted-foreground mr-6 mt-2 font-medium">
                      🅰️ Assist: {goal.assistPlayerName}
                    </div>
                  )}
                </div>
              ))}
              {awayGoals.length === 0 && (
                <div className="text-sm text-muted-foreground italic text-center py-4">No goals scored</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsSection;
