
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap } from "lucide-react";

interface QuickGoalEntryProps {
  homeTeamName: string;
  awayTeamName: string;
  onAddGoal: (team: 'home' | 'away') => void;
  onOpenWizard: () => void;
}

const QuickGoalEntry = ({
  homeTeamName,
  awayTeamName,
  onAddGoal,
  onOpenWizard
}: QuickGoalEntryProps) => {
  return (
    <div className="space-y-4">
      {/* Quick Goal Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => onAddGoal('home')}
          variant="outline"
          className="h-16 text-lg flex flex-col items-center gap-1"
        >
          <Zap className="h-5 w-5" />
          <span>Quick Goal</span>
          <span className="text-sm font-normal">{homeTeamName}</span>
        </Button>
        <Button
          onClick={() => onAddGoal('away')}
          variant="outline"
          className="h-16 text-lg flex flex-col items-center gap-1"
        >
          <Zap className="h-5 w-5" />
          <span>Quick Goal</span>
          <span className="text-sm font-normal">{awayTeamName}</span>
        </Button>
      </div>

      {/* Detailed Goal Entry */}
      <div className="border-t pt-4">
        <Button
          onClick={onOpenWizard}
          className="w-full h-12"
          variant="default"
        >
          <Target className="h-4 w-4 mr-2" />
          Detailed Goal Entry (Recommended)
        </Button>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Assign player, handle assists, and own goals
        </p>
      </div>
    </div>
  );
};

export default QuickGoalEntry;
