
import { Badge } from "@/components/ui/badge";
import { Target, Users, User } from "lucide-react";

interface GoalData {
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  type: 'goal' | 'assist';
}

interface AssignedGoalsListProps {
  goals: GoalData[];
  formatTime: (seconds: number) => string;
}

const AssignedGoalsList = ({
  goals,
  formatTime
}: AssignedGoalsListProps) => {
  return (
    <div className="space-y-3 pt-4 border-t">
      <h4 className="font-semibold flex items-center gap-2">
        <User className="h-4 w-4" />
        Match Events ({goals.length})
      </h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {goals.map((goal, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
            <div className="flex items-center gap-3">
              <Badge 
                variant={goal.type === 'goal' ? 'default' : 'outline'}
                className={goal.type === 'goal' ? 'bg-green-600' : 'border-blue-500 text-blue-600'}
              >
                {goal.type === 'goal' ? (
                  <><Target className="h-3 w-3 mr-1" />Goal</>
                ) : (
                  <><Users className="h-3 w-3 mr-1" />Assist</>
                )}
              </Badge>
              <div>
                <span className="font-medium text-sm">{goal.playerName}</span>
                <div className="text-xs text-muted-foreground">{goal.team}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">{formatTime(goal.time)}</span>
              {goal.type === 'goal' && (
                <span className="text-xs text-green-600 font-medium">Score Updated</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedGoalsList;
