
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface Goal {
  playerName: string;
  team: string;
  type: string;
  time: number;
}

interface GoalsTabGoalsListProps {
  goals: Goal[];
  formatTime: (seconds: number) => string;
}

const GoalsTabGoalsList = ({ goals, formatTime }: GoalsTabGoalsListProps) => {
  if (goals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Match Goals & Assists ({goals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {goals.map((goal, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  goal.playerName === 'Quick Goal' ? 'bg-orange-500' : 'bg-green-500'
                }`} />
                <div>
                  <span className="font-medium">
                    {goal.playerName === 'Quick Goal' ? '⚡ Quick Goal (No Details)' : goal.playerName}
                  </span>
                  <span className="text-muted-foreground ml-2">({goal.team})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium capitalize flex items-center gap-1">
                  {goal.type === 'goal' && <Trophy className="h-3 w-3" />}
                  {goal.type}
                </div>
                <div className="text-xs text-muted-foreground">{formatTime(goal.time)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsTabGoalsList;
