
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
    <div className="space-y-2">
      {goals.slice(0, 3).map((goal, index) => (
        <div 
          key={index} 
          className="flex items-center gap-2 text-xs animate-fade-in hover:bg-muted/30 rounded-md p-1 transition-all duration-200 hover-scale"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Target className="h-3 w-3 transition-transform duration-200" style={{ color: teamColor }} />
          <span className="font-medium text-foreground flex-1">
            {getGoalPlayerName(goal)}
          </span>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 font-mono">
            {Math.floor(getGoalTime(goal) / 60)}'
          </Badge>
          {goal.type === 'assist' && (
            <Users className="h-3 w-3 text-blue-500 animate-pulse" />
          )}
          {goal.isOwnGoal && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              OG
            </Badge>
          )}
        </div>
      ))}
      {goals.length > 3 && (
        <div className="text-xs text-muted-foreground pl-5 animate-fade-in opacity-75">
          +{goals.length - 3} more goal{goals.length - 3 !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default CompactGoalScorers;
