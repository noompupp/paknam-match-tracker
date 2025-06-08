
import { Button } from "@/components/ui/button";
import { Target, Users } from "lucide-react";

interface GoalAssignmentButtonProps {
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  matchTime: number;
  formatTime: (seconds: number) => string;
  onAssignGoal: () => void;
}

const GoalAssignmentButton = ({
  selectedPlayer,
  selectedGoalType,
  selectedGoalTeam,
  matchTime,
  formatTime,
  onAssignGoal
}: GoalAssignmentButtonProps) => {
  const isDisabled = !selectedPlayer || !selectedGoalTeam;
  const Icon = selectedGoalType === 'goal' ? Target : Users;

  return (
    <Button
      onClick={onAssignGoal}
      disabled={isDisabled}
      className="w-full min-h-[44px]"
      size="lg"
    >
      <Icon className="h-4 w-4 mr-2" />
      Assign {selectedGoalType === 'goal' ? 'Goal' : 'Assist'} at {formatTime(matchTime)}
    </Button>
  );
};

export default GoalAssignmentButton;
