
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Target, Edit, AlertCircle } from "lucide-react";
import { useMatchStore } from "@/stores/useMatchStore";

interface SimplifiedQuickGoalSectionProps {
  unassignedGoalsCount: number;
  isProcessingQuickGoal: boolean;
  onQuickGoal: () => void;
  onFullGoalEntry: () => void;
  onAddDetailsToGoals: () => void;
}

const SimplifiedQuickGoalSection = ({
  unassignedGoalsCount,
  isProcessingQuickGoal,
  onQuickGoal,
  onFullGoalEntry,
  onAddDetailsToGoals
}: SimplifiedQuickGoalSectionProps) => {
  // Enhanced real-time subscription to store updates
  const { lastUpdated, getUnassignedGoalsCount } = useMatchStore();
  
  // Enhanced real-time unassigned goals count calculation
  const realTimeUnassignedCount = getUnassignedGoalsCount();
  
  console.log('📊 SimplifiedQuickGoalSection: Enhanced real-time data:', {
    propsCount: unassignedGoalsCount,
    realTimeCount: realTimeUnassignedCount,
    lastUpdated,
    timestamp: new Date().toISOString()
  });

  // Use the most accurate count (prioritize real-time store data)
  const effectiveUnassignedCount = realTimeUnassignedCount;

  const handleAddDetailsClick = () => {
    console.log('📝 SimplifiedQuickGoalSection: Enhanced add details clicked:', {
      effectiveCount: effectiveUnassignedCount,
      propsCount: unassignedGoalsCount,
      realTimeCount: realTimeUnassignedCount
    });
    onAddDetailsToGoals();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Goal Recording
          {effectiveUnassignedCount > 0 && (
            <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full animate-pulse">
              {effectiveUnassignedCount} need details
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

        {/* Enhanced Add Details Section - Real-time responsive */}
        {effectiveUnassignedCount > 0 && (
          <div className="space-y-2 border-t pt-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 transition-all duration-200 hover:bg-orange-100">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-orange-800">
                    {effectiveUnassignedCount} goal{effectiveUnassignedCount !== 1 ? 's' : ''} need player details
                  </div>
                  <div className="text-xs text-orange-700">
                    Quick goals recorded during the match • Enhanced real-time sync
                  </div>
                </div>
              </div>
              <Button
                onClick={handleAddDetailsClick}
                variant="outline"
                className="w-full hover:bg-orange-100 hover:border-orange-300 border-orange-200 transition-all duration-200"
                disabled={isProcessingQuickGoal}
              >
                <Edit className="h-4 w-4 mr-2" />
                Add Details to Goal{effectiveUnassignedCount !== 1 ? 's' : ''} ({effectiveUnassignedCount} goal{effectiveUnassignedCount !== 1 ? 's' : ''})
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <strong>Quick Goal:</strong> Instant scoring • <strong>Full Entry:</strong> Complete with details
            {effectiveUnassignedCount > 0 && (
              <span className="block text-xs text-orange-600 mt-1">
                Enhanced real-time sync active • Updates: {lastUpdated}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedQuickGoalSection;
