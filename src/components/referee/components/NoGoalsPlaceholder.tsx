
import { Target } from "lucide-react";

const NoGoalsPlaceholder = () => {
  return (
    <div className="text-center text-muted-foreground py-6 border-2 border-dashed border-gray-200 rounded-lg">
      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No goals or assists assigned yet</p>
      <p className="text-xs mt-1">Assign your first goal to see automatic score updates</p>
    </div>
  );
};

export default NoGoalsPlaceholder;
