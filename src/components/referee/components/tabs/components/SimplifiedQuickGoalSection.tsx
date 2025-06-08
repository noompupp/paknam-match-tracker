
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Target, Edit, AlertCircle } from "lucide-react";

interface SimplifiedQuickGoalSectionProps {
  unassignedGoalsCount: number;
  isProcessingQuickGoal: boolean;
  onQuickGoal: () => void;
  onFullGoalEntry: () => void;
  onAddDetailsToGoals: () => void; // Fixed prop name
}

const SimplifiedQuickGoalSection = ({
  unassignedGoalsCount,
  isProcessingQuickGoal,
  onQuickGoal,
  onFullGoalEntry,
  onAddDetailsToGoals // Updated prop name
}: SimplifiedQuickGoalSectionProps) => {
  console.log('📊 SimplifiedQuickGoalSection: Rendering with unassigned goals count:', unassignedGoalsCount);

  const handleAddDetailsClick = () => {
    console.log('📝 SimplifiedQuickGoalSection: Add details button clicked, count:', unassignedGoalsCount);
    onAddDetailsToGoals();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Goal Recording
          {unassignedGoalsCount > 0 && (
            <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              {unassignedGoalsCount} need details
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Quick Goal Button */}
        <div className="space-y-2">
          <Button
            onClick={onQuickGoal}
            disabled={isProcessingQuickGoal}
            variant="outline"
            className="w-full h-16 text-base flex items-center gap-3 hover:bg-green-50 hover:border-green-300 border-2 border-green-200"
          >
            <Zap className="h-6 w-6 text-green-600" />
            <div className="text-center flex-1">
              <div className="font-medium text-lg">
                {isProcessingQuickGoal ? 'Adding Quick Goal...' : 'Quick Goal'}
              </div>
              <div className="text-xs text-muted-foreground">
                Instant scoring for live matches
              </div>
            </div>
          </Button>
        </div>

        {/* Full Goal Entry Button */}
        <div className="space-y-2">
          <Button
            onClick={onFullGoalEntry}
            className="w-full h-16 text-base flex items-center gap-3"
            disabled={isProcessingQuickGoal}
          >
            <Target className="h-6 w-6" />
            <div className="text-center flex-1">
              <div className="font-medium text-lg">Full Goal Entry Wizard</div>
              <div className="text-xs">Complete recording with player details</div>
            </div>
          </Button>
        </div>

        {/* Enhanced Add Details to Earlier Goals - Now properly enabled when goals exist */}
        {unassignedGoalsCount > 0 && (
          <div className="space-y-2 border-t pt-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-orange-800">
                    {unassignedGoalsCount} goal{unassignedGoalsCount !== 1 ? 's' : ''} need player details
                  </div>
                  <div className="text-xs text-orange-700">
                    Quick goals recorded during the match
                  </div>
                </div>
              </div>
              <Button
                onClick={handleAddDetailsClick}
                variant="outline"
                className="w-full hover:bg-orange-100 hover:border-orange-300 border-orange-200"
                disabled={isProcessingQuickGoal}
              >
                <Edit className="h-4 w-4 mr-2" />
                Add Details to Goal{unassignedGoalsCount !== 1 ? 's' : ''} ({unassignedGoalsCount} goal{unassignedGoalsCount !== 1 ? 's' : ''})
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <strong>Quick Goal:</strong> Instant scoring • <strong>Full Entry:</strong> Complete with details
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedQuickGoalSection;
