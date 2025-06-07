
import { Trophy } from "lucide-react";

interface GoalsSectionHeaderProps {
  totalGoals: number;
}

const GoalsSectionHeader = ({ totalGoals }: GoalsSectionHeaderProps) => {
  return (
    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
      <Trophy className="h-5 w-5 text-yellow-600" />
      Goals ({totalGoals})
    </h3>
  );
};

export default GoalsSectionHeader;
