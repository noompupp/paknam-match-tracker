
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

interface GoalAssignmentButtonProps {
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  matchTime: number;
  formatTime: (seconds: number) => string;
  onAssignGoal: () => void;
}

const GoalAssignmentButton = ({
  selectedPlayer,
  selectedGoalType,
  matchTime,
  formatTime,
  onAssignGoal
}: GoalAssignmentButtonProps) => {
  return (
    <Button 
      onClick={onAssignGoal} 
      className="w-full"
      disabled={!selectedPlayer}
    >
      <Target className="h-4 w-4 mr-2" />
      Assign {selectedGoalType === 'goal' ? 'Goal' : 'Assist'} at {formatTime(matchTime)}
      {selectedGoalType === 'goal' && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
          Score will update automatically
        </span>
      )}
    </Button>
  );
};

export default GoalAssignmentButton;
