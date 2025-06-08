
import { useState } from "react";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";

interface QuickGoalHandlerProps {
  selectedFixtureData: any;
  matchTime: number;
  formatTime: (seconds: number) => string;
  onQuickGoalAdded?: () => void;
  forceRefresh?: () => Promise<void>;
  onSaveMatch?: () => void;
}

export const useQuickGoalHandler = ({
  selectedFixtureData,
  matchTime,
  formatTime,
  onQuickGoalAdded,
  forceRefresh,
  onSaveMatch
}: QuickGoalHandlerProps) => {
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);
  const { toast } = useToast();

  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!selectedFixtureData || isProcessingQuickGoal) return;

    setIsProcessingQuickGoal(true);

    try {
      console.log('⚡ QuickGoalHandler: Adding quick goal for team:', team);
      
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
          description: result.message,
        });
        
        // Trigger immediate score refresh after quick goal
        if (forceRefresh) {
          console.log('🔄 QuickGoalHandler: Triggering immediate score refresh after quick goal');
          setTimeout(() => {
            forceRefresh();
          }, 500); // Slightly longer delay for quick goal processing
        }
        
        if (onSaveMatch) {
          onSaveMatch();
        }

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
      console.error('❌ QuickGoalHandler: Error adding quick goal:', error);
      toast({
        title: "Quick Goal Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessingQuickGoal(false);
    }
  };

  return {
    isProcessingQuickGoal,
    handleQuickGoal
  };
};
