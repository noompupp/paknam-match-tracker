
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

const GoalAssignmentHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        Goal & Assist Assignment
      </CardTitle>
      <div className="text-sm text-muted-foreground">
        Assign goals and assists to players - scores update automatically when goals are assigned
      </div>
    </CardHeader>
  );
};

export default GoalAssignmentHeader;
