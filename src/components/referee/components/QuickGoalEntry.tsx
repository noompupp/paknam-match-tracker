
import { Button } from "@/components/ui/button";
import { Target, Zap, Edit, AlertCircle } from "lucide-react";

interface QuickGoalEntryProps {
  homeTeamName: string;
  awayTeamName: string;
  onAddGoal: (team: 'home' | 'away') => void;
  onOpenWizard: () => void;
  unassignedGoalsCount?: number;
  isProcessing?: boolean;
}

const QuickGoalEntry = ({
  homeTeamName,
  awayTeamName,
  onAddGoal,
  onOpenWizard,
  unassignedGoalsCount = 0,
  isProcessing = false
}: QuickGoalEntryProps) => {
  return (
    <div className="space-y-6">
      {/* Quick Goal Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-600" />
          <h4 className="font-medium">Quick Goal (Instant Recording)</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onAddGoal('home')}
            disabled={isProcessing}
            variant="outline"
            className="h-16 text-base flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300 border-2"
          >
            <Zap className="h-5 w-5 text-green-600" />
            <span className="font-semibold">{isProcessing ? 'Adding...' : 'Quick Goal'}</span>
            <span className="text-sm font-normal text-muted-foreground">{homeTeamName}</span>
          </Button>
          <Button
            onClick={() => onAddGoal('away')}
            disabled={isProcessing}
            variant="outline"
            className="h-16 text-base flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300 border-2"
          >
            <Zap className="h-5 w-5 text-green-600" />
            <span className="font-semibold">{isProcessing ? 'Adding...' : 'Quick Goal'}</span>
            <span className="text-sm font-normal text-muted-foreground">{awayTeamName}</span>
          </Button>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground bg-green-50 px-3 py-2 rounded-lg">
            ⚡ <strong>Perfect for live matches</strong> - Instant score update, assign details later
          </p>
        </div>
      </div>

      {/* Full Detail Entry Section */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium">Full Detail Entry</h4>
        </div>
        <Button
          onClick={onOpenWizard}
          className="w-full h-12"
          disabled={isProcessing}
        >
          <Target className="h-4 w-4 mr-2" />
          Complete Goal Entry Wizard
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground bg-blue-50 px-3 py-2 rounded-lg">
            🎯 <strong>Complete recording</strong> - Player names, assists, cards, and timing details
          </p>
        </div>
      </div>

      {/* Assign Details Section */}
      {unassignedGoalsCount > 0 && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Edit className="h-4 w-4 text-orange-600" />
            <h4 className="font-medium">Assign Details to Quick Goals</h4>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                {unassignedGoalsCount} quick goal{unassignedGoalsCount !== 1 ? 's' : ''} need player details
              </span>
            </div>
            <Button
              onClick={onOpenWizard}
              variant="outline"
              className="w-full hover:bg-orange-100 hover:border-orange-300"
              disabled={isProcessing}
            >
              <Edit className="h-4 w-4 mr-2" />
              Assign Player Names & Assists
            </Button>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground bg-orange-50 px-3 py-2 rounded-lg">
              ✏️ <strong>Add missing details</strong> - Convert quick goals to complete records
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickGoalEntry;
