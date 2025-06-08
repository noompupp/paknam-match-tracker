
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
          Quick Goal Entry
          {unassignedGoalsCount > 0 && (
            <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              {unassignedGoalsCount} need details
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => onQuickGoal('home')}
            disabled={isProcessingQuickGoal}
            variant="outline"
            className="h-16 text-lg flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300 border-2"
          >
            <Zap className="h-5 w-5 text-green-600" />
            <span>{isProcessingQuickGoal ? 'Adding...' : '⚡ Quick Goal'}</span>
            <span className="text-sm font-normal">{homeTeamName}</span>
          </Button>
          <Button
            onClick={() => onQuickGoal('away')}
            disabled={isProcessingQuickGoal}
            variant="outline"
            className="h-16 text-lg flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300 border-2"
          >
            <Zap className="h-5 w-5 text-green-600" />
            <span>{isProcessingQuickGoal ? 'Adding...' : '⚡ Quick Goal'}</span>
            <span className="text-sm font-normal">{awayTeamName}</span>
          </Button>
        </div>
        
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Button
              onClick={() => onDetailedGoalEntry('home')}
              variant="outline"
              className="h-12"
              disabled={isProcessingQuickGoal}
            >
              <Target className="h-4 w-4 mr-2" />
              Goal Entry - {homeTeamName}
            </Button>
            <Button
              onClick={() => onDetailedGoalEntry('away')}
              variant="outline"
              className="h-12"
              disabled={isProcessingQuickGoal}
            >
              <Target className="h-4 w-4 mr-2" />
              Goal Entry - {awayTeamName}
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
          
          {unassignedGoalsCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Edit className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  {unassignedGoalsCount} quick goal{unassignedGoalsCount !== 1 ? 's' : ''} need player details
                </span>
              </div>
              <Button
                onClick={onOpenDetailedEntry}
                variant="outline"
                className="w-full hover:bg-orange-100 hover:border-orange-300"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Assign Player Details
              </Button>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground text-center">
            <strong>Quick Goal:</strong> Instant scoring for live matches • <strong>Goal Entry:</strong> Complete details with assists
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickGoalSection;
