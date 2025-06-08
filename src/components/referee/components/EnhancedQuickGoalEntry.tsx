
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Target, Edit, AlertCircle } from "lucide-react";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";

interface EnhancedQuickGoalEntryProps {
  selectedFixtureData: any;
  matchTime: number;
  formatTime: (seconds: number) => string;
  onQuickGoalAdded?: () => void;
  onOpenDetailedEntry?: (team?: 'home' | 'away') => void;
  unassignedGoalsCount?: number;
}

const EnhancedQuickGoalEntry = ({
  selectedFixtureData,
  matchTime,
  formatTime,
  onQuickGoalAdded,
  onOpenDetailedEntry,
  unassignedGoalsCount = 0
}: EnhancedQuickGoalEntryProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!selectedFixtureData || isProcessing) return;

    setIsProcessing(true);

    try {
      const homeTeamId = selectedFixtureData.home_team?.__id__ || selectedFixtureData.home_team_id;
      const awayTeamId = selectedFixtureData.away_team?.__id__ || selectedFixtureData.away_team_id;

      const result = await quickGoalService.addQuickGoal({
        fixtureId: selectedFixtureData.id,
        team,
        matchTime,
        homeTeam: {
          id: homeTeamId,
          name: selectedFixtureData.home_team?.name,
          __id__: homeTeamId
        },
        awayTeam: {
          id: awayTeamId,
          name: selectedFixtureData.away_team?.name,
          __id__: awayTeamId
        }
      });

      if (result.success) {
        toast({
          title: "⚡ Quick Goal Added!",
          description: `Goal recorded for ${team === 'home' ? homeTeamName : awayTeamName} at ${formatTime(matchTime)}`,
        });
        
        if (onQuickGoalAdded) {
          onQuickGoalAdded();
        }
      } else {
        toast({
          title: "Quick Goal Failed",
          description: result.error || 'Failed to add quick goal',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ EnhancedQuickGoalEntry: Error adding quick goal:', error);
      toast({
        title: "Quick Goal Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            Goal Recording System
          </div>
          {unassignedGoalsCount > 0 && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              <AlertCircle className="h-3 w-3" />
              {unassignedGoalsCount} need details
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Goal Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-600" />
            <h4 className="font-medium">Quick Goal (Instant Recording)</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleQuickGoal('home')}
              disabled={isProcessing}
              variant="outline"
              className="h-16 text-base flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300 border-2 transition-all"
            >
              <Zap className="h-5 w-5 text-green-600" />
              <span className="font-semibold">{isProcessing ? 'Adding...' : 'Quick Goal'}</span>
              <span className="text-sm font-normal text-muted-foreground">{homeTeamName}</span>
            </Button>
            <Button
              onClick={() => handleQuickGoal('away')}
              disabled={isProcessing}
              variant="outline"
              className="h-16 text-base flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300 border-2 transition-all"
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
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onOpenDetailedEntry?.('home')}
              variant="outline"
              className="h-12 flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              disabled={isProcessing}
            >
              <Target className="h-4 w-4 text-blue-600" />
              <span>Goal for {homeTeamName}</span>
            </Button>
            <Button
              onClick={() => onOpenDetailedEntry?.('away')}
              variant="outline"
              className="h-12 flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              disabled={isProcessing}
            >
              <Target className="h-4 w-4 text-blue-600" />
              <span>Goal for {awayTeamName}</span>
            </Button>
          </div>
          <Button
            onClick={() => onOpenDetailedEntry?.()}
            className="w-full h-12"
            disabled={isProcessing}
          >
            <Target className="h-4 w-4 mr-2" />
            Complete Goal Entry Wizard
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground bg-blue-50 px-3 py-2 rounded-lg">
              🎯 <strong>Complete recording</strong> - Player names, assists, cards, and timing
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
                  {unassignedGoalsCount} quick goal{unassignedGoalsCount !== 1 ? 's' : ''} waiting for player details
                </span>
              </div>
              <Button
                onClick={() => onOpenDetailedEntry?.()}
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
      </CardContent>
    </Card>
  );
};

export default EnhancedQuickGoalEntry;
