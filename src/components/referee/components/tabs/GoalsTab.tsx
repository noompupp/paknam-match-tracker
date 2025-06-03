
import GoalAssignment from "../../GoalAssignment";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface GoalsTabProps {
  allPlayers: ComponentPlayer[];
  goals: any[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onAssignGoal: () => void;
  formatTime: (seconds: number) => string;
}

const GoalsTab = ({
  allPlayers,
  goals,
  selectedPlayer,
  selectedGoalType,
  matchTime,
  onPlayerSelect,
  onGoalTypeChange,
  onAssignGoal,
  formatTime
}: GoalsTabProps) => {
  return (
    <GoalAssignment
      allPlayers={allPlayers}
      goals={goals}
      selectedPlayer={selectedPlayer}
      selectedGoalType={selectedGoalType}
      matchTime={matchTime}
      onPlayerSelect={onPlayerSelect}
      onGoalTypeChange={onGoalTypeChange}
      onAssignGoal={onAssignGoal}
      formatTime={formatTime}
    />
  );
};

export default GoalsTab;
