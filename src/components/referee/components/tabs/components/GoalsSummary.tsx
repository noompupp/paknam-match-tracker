
import { Goal, Clock, User } from "lucide-react";
import RefereeCard from "../../../shared/RefereeCard";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  playerName: string;
  teamName: string;
  type: 'goal' | 'assist';
  time: number;
  isOwnGoal?: boolean;
  synced?: boolean;
}

interface GoalsSummaryProps {
  goals: Goal[];
  formatTime: (seconds: number) => string;
}

const GoalsSummary = ({ goals, formatTime }: GoalsSummaryProps) => {
  if (goals.length === 0) return null;

  const sortedGoals = [...goals].sort((a, b) => a.time - b.time);

  return (
    <RefereeCard
      title="Goals Summary"
      icon={<Goal className="h-5 w-5" />}
      subtitle={`${goals.length} goal${goals.length !== 1 ? 's' : ''} recorded`}
    >
      <div className="space-y-3">
        {sortedGoals.map((goal) => (
          <div
            key={goal.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              goal.synced 
                ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                : "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                goal.type === 'goal' 
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/10 text-secondary"
              )}>
                {goal.type === 'goal' ? <Goal className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div>
                <div className="font-medium text-sm">
                  {goal.playerName}
                  {goal.isOwnGoal && <span className="text-destructive ml-1">(OG)</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {goal.teamName} • {goal.type}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3" />
              {formatTime(goal.time)}
              {!goal.synced && (
                <span className="text-xs text-orange-600 font-medium">
                  Unsaved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </RefereeCard>
  );
};

export default GoalsSummary;
