
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";

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
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5" />
        <h3 className="font-semibold">Quick Goal Entry</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => onAddGoal('home')}
          variant="outline"
          className="h-12 flex flex-col gap-1"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Goal for {homeTeamName}</span>
        </Button>
        
        <Button
          onClick={() => onAddGoal('away')}
          variant="outline"
          className="h-12 flex flex-col gap-1"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Goal for {awayTeamName}</span>
        </Button>
      </div>
      
      <Button
        onClick={onOpenWizard}
        variant="default"
        className="w-full"
      >
        <Target className="h-4 w-4 mr-2" />
        Detailed Goal Entry
      </Button>
    </div>
  );
};

export default QuickGoalEntry;
