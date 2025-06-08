
import { useState } from "react";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";
import { useMatchStore } from "@/stores/useMatchStore";

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
  const { addGoal, addEvent } = useMatchStore();

  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!selectedFixtureData || isProcessingQuickGoal) return;

    setIsProcessingQuickGoal(true);

    try {
      console.log('⚡ QuickGoalHandler: Adding quick goal for team:', team);
      
      const homeTeamId = selectedFixtureData.home_team?.__id__ || selectedFixtureData.home_team_id;
      const awayTeamId = selectedFixtureData.away_team?.__id__ || selectedFixtureData.away_team_id;
      const teamId = team === 'home' ? homeTeamId : awayTeamId;
      const teamName = team === 'home' ? selectedFixtureData.home_team?.name : selectedFixtureData.away_team?.name;

      // Optimistic update to local store first for immediate UI feedback
      console.log('🚀 QuickGoalHandler: Adding optimistic update to store');
      const localGoal = addGoal({
        playerName: 'Quick Goal',
        team,
        teamId,
        teamName,
        type: 'goal',
        time: matchTime
      });

      addEvent('Quick Goal', `Quick goal added for ${teamName}`, matchTime);

      // Show immediate feedback
      toast({
        title: "⚡ Quick Goal Added!",
        description: `Goal added for ${teamName} - syncing to database...`,
      });

      // Then sync to database
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
        console.log('✅ QuickGoalHandler: Database sync successful');
        
        // Update the toast with success
        toast({
          title: "⚡ Quick Goal Synced!",
          description: `Goal for ${teamName} saved to database successfully!`,
        });
        
        // Trigger refresh for score sync after database update
        if (forceRefresh) {
          console.log('🔄 QuickGoalHandler: Triggering refresh for score sync');
          setTimeout(() => {
            forceRefresh();
          }, 200);
        }
        
        if (onSaveMatch) {
          onSaveMatch();
        }

        if (onQuickGoalAdded) {
          onQuickGoalAdded();
        }
      } else {
        console.error('❌ QuickGoalHandler: Database sync failed:', result.error);
        
        // Revert the optimistic update on failure
        // TODO: Implement removeGoal call here if needed
        
        toast({
          title: "Quick Goal Failed",
          description: result.error || 'Failed to sync goal to database',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ QuickGoalHandler: Error adding quick goal:', error);
      
      // Revert optimistic update on error
      // TODO: Implement removeGoal call here if needed
      
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
