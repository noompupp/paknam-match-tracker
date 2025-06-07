
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { getGoalAssistPlayerName } from "../utils/matchSummaryDataProcessor";

interface GoalsSectionProps {
  goals: any[];
  processedEvents: {
    homeGoals: any[];
    awayGoals: any[];
  };
  homeTeamColor: string;
  awayTeamColor: string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
}

const GoalsSection = ({
  goals,
  processedEvents,
  homeTeamColor,
  awayTeamColor,
  getGoalPlayerName,
  getGoalTime
}: GoalsSectionProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <Target className="h-4 w-4" />
          Goals ({goals.length})
        </h4>
        
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No goals recorded</p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const isHomeGoal = processedEvents.homeGoals.includes(goal);
              const teamColor = isHomeGoal ? homeTeamColor : awayTeamColor;
              const playerName = getGoalPlayerName(goal);
              const assistName = getGoalAssistPlayerName(goal);
              const time = getGoalTime(goal);
              
              return (
                <div 
                  key={`goal-${goal.id}-${index}`} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: teamColor }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{playerName}</div>
                      {assistName && (
                        <div className="text-xs text-muted-foreground">
                          Assist: {assistName}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.floor(time / 60)}'
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsSection;
