
import { Goal, Clock, User, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RefereeCard from "../../../shared/RefereeCard";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  playerName: string;
  teamName: string;
  type: 'goal' | 'assist';
  time: number;
  isOwnGoal?: boolean;
  synced?: boolean;
}

interface EnhancedGoalsSummaryProps {
  goals: Goal[];
  formatTime: (seconds: number) => string;
  onRemoveGoal?: (goalId: string) => void;
  onUndoGoal?: (goalId: string) => void;
}

const EnhancedGoalsSummary = ({ 
  goals, 
  formatTime, 
  onRemoveGoal, 
  onUndoGoal 
}: EnhancedGoalsSummaryProps) => {
  const { toast } = useToast();

  if (goals.length === 0) return null;

  const sortedGoals = [...goals].sort((a, b) => a.time - b.time);

  const handleRemoveGoal = (goal: Goal) => {
    if (!onRemoveGoal) return;

    const confirmed = window.confirm(
      `Remove ${goal.type} by ${goal.playerName}?\n\nThis action cannot be undone if the data has been saved.`
    );

    if (confirmed) {
      onRemoveGoal(goal.id);
      toast({
        title: "Goal Removed",
        description: `${goal.type} by ${goal.playerName} has been removed`,
        duration: 3000,
      });
    }
  };

  const handleUndoGoal = (goal: Goal) => {
    if (!onUndoGoal) return;

    onUndoGoal(goal.id);
    toast({
      title: "Goal Undone",
      description: `${goal.type} by ${goal.playerName} has been undone`,
      duration: 3000,
    });
  };

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
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "p-2 rounded-full flex-shrink-0",
                goal.type === 'goal' 
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/10 text-secondary"
              )}>
                {goal.type === 'goal' ? <Goal className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">
                  {goal.playerName}
                  {goal.isOwnGoal && <span className="text-destructive ml-1">(OG)</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {goal.teamName} • {goal.type}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Time */}
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />
                {formatTime(goal.time)}
              </div>

              {/* Status */}
              {!goal.synced && (
                <span className="text-xs text-orange-600 font-medium">
                  Unsaved
                </span>
              )}

              {/* Action Buttons */}
              <div className="flex gap-1">
                {!goal.synced && onUndoGoal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUndoGoal(goal)}
                    className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-700"
                    title="Undo this goal"
                  >
                    <Undo2 className="h-3 w-3" />
                  </Button>
                )}

                {onRemoveGoal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveGoal(goal)}
                    className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                    title="Delete this goal"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </RefereeCard>
  );
};

export default EnhancedGoalsSummary;
