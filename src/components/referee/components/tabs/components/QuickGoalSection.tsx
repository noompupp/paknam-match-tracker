
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Target, Edit } from "lucide-react";

interface QuickGoalSectionProps {
  homeTeamName: string;
  awayTeamName: string;
  unassignedGoalsCount: number;
  isProcessingQuickGoal: boolean;
  onQuickGoal: (team: 'home' | 'away') => void;
  onDetailedGoalEntry: (team: 'home' | 'away') => void;
  onOpenDetailedEntry: () => void;
}

const QuickGoalSection = ({
  homeTeamName,
  awayTeamName,
  unassignedGoalsCount,
  isProcessingQuickGoal,
  onQuickGoal,
  onDetailedGoalEntry,
  onOpenDetailedEntry
}: QuickGoalSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Goal Recording Workflow
          {unassignedGoalsCount > 0 && (
            <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              {unassignedGoalsCount} need details
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Step 1: Quick Goal - Instant recording for live matches */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">1</span>
            <h4 className="text-sm font-medium">Quick Goal (Instant Recording)</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Perfect for live matches - instantly updates the score and records the goal. Add player details later.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onQuickGoal('home')}
              disabled={isProcessingQuickGoal}
              variant="outline"
              className="h-16 text-base flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 border-2 border-green-200"
            >
              <Zap className="h-5 w-5 text-green-600" />
              <div className="text-center">
                <div className="font-medium">{isProcessingQuickGoal ? 'Adding...' : 'Quick Goal'}</div>
                <div className="text-xs text-muted-foreground">{homeTeamName}</div>
              </div>
            </Button>
            <Button
              onClick={() => onQuickGoal('away')}
              disabled={isProcessingQuickGoal}
              variant="outline"
              className="h-16 text-base flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 border-2 border-green-200"
            >
              <Zap className="h-5 w-5 text-green-600" />
              <div className="text-center">
                <div className="font-medium">{isProcessingQuickGoal ? 'Adding...' : 'Quick Goal'}</div>
                <div className="text-xs text-muted-foreground">{awayTeamName}</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Step 2: Goal with Details - Complete recording */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">2</span>
            <h4 className="text-sm font-medium">Goal with Details - Complete Recording</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Record a goal with full details including player name, assists, and match context in one step.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Button
              onClick={() => onDetailedGoalEntry('home')}
              variant="outline"
              className="h-14 flex flex-col items-center gap-1 hover:bg-blue-50 hover:border-blue-300 border-2 border-blue-200"
              disabled={isProcessingQuickGoal}
            >
              <Target className="h-4 w-4 text-blue-600" />
              <div className="text-center">
                <div className="text-sm font-medium">Goal with Details</div>
                <div className="text-xs text-muted-foreground">{homeTeamName}</div>
              </div>
            </Button>
            <Button
              onClick={() => onDetailedGoalEntry('away')}
              variant="outline"
              className="h-14 flex flex-col items-center gap-1 hover:bg-blue-50 hover:border-blue-300 border-2 border-blue-200"
              disabled={isProcessingQuickGoal}
            >
              <Target className="h-4 w-4 text-blue-600" />
              <div className="text-center">
                <div className="text-sm font-medium">Goal with Details</div>
                <div className="text-xs text-muted-foreground">{awayTeamName}</div>
              </div>
            </Button>
          </div>
          
          <Button
            onClick={onOpenDetailedEntry}
            className="w-full h-12 mb-4"
            disabled={isProcessingQuickGoal}
          >
            <Target className="h-4 w-4 mr-2" />
            Full Goal Entry Wizard
          </Button>
        </div>

        {/* Step 3: Edit Earlier Goals - Only show if there are unassigned goals */}
        {unassignedGoalsCount > 0 && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">3</span>
              <h4 className="text-sm font-medium">Edit Earlier Goals</h4>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Edit className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  {unassignedGoalsCount} quick goal{unassignedGoalsCount !== 1 ? 's' : ''} need player details
                </span>
              </div>
              <p className="text-xs text-orange-700 mb-3">
                These goals were recorded quickly during the match. Add player names and assists now.
              </p>
              <Button
                onClick={onOpenDetailedEntry}
                variant="outline"
                className="w-full hover:bg-orange-100 hover:border-orange-300"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Goal Details ({unassignedGoalsCount} goal{unassignedGoalsCount !== 1 ? 's' : ''})
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <strong>Quick Goal:</strong> Instant scoring for live matches • <strong>Goal with Details:</strong> Complete recording with assists
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickGoalSection;
