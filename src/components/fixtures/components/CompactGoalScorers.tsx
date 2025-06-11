
import { Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CompactGoalScorersProps {
  goals: any[];
  teamColor: string;
  teamName: string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
}

const CompactGoalScorers = ({
  goals,
  teamColor,
  teamName,
  getGoalPlayerName,
  getGoalTime
}: CompactGoalScorersProps) => {
  if (goals.length === 0) return null;

  return (
    <div className="space-y-1">
      {goals.slice(0, 3).map((goal, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <Target className="h-3 w-3" style={{ color: teamColor }} />
          <span className="font-medium text-foreground">
            {getGoalPlayerName(goal)}
          </span>
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {Math.floor(getGoalTime(goal) / 60)}'
          </Badge>
          {goal.type === 'assist' && (
            <Users className="h-3 w-3 text-blue-500" />
          )}
        </div>
      ))}
      {goals.length > 3 && (
        <div className="text-xs text-muted-foreground">
          +{goals.length - 3} more goals
        </div>
      )}
    </div>
  );
};

export default CompactGoalScorers;
