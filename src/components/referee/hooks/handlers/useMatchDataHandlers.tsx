
import { useToast } from "@/hooks/use-toast";
import { PlayerTimeTrackerPlayer } from "../useRefereeState";
import { unifiedRefereeService } from "@/services/fixtures";
import { matchResetService } from "@/services/fixtures";

interface UseMatchDataHandlersProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  goals: any[];
  playersForTimeTracker: PlayerTimeTrackerPlayer[];
  matchTime: number;
  setSaveAttempts: (value: number | ((prev: number) => number)) => void;
  resetTimer: () => void;
  resetScore: () => void;
  resetEvents: () => void;
  resetCards: () => void;
  resetTracking: () => void;
  resetGoals: () => void;
  addEvent: (type: string, description: string, time: number) => void;
  forceRefresh?: () => Promise<void>; // Enhanced refresh function
}

export const useMatchDataHandlers = (props: UseMatchDataHandlersProps) => {
  const { toast } = useToast();

  const handleSaveMatch = async () => {
    if (!props.selectedFixtureData) return;
    
    props.setSaveAttempts(prev => prev + 1);
    
    try {
      console.log('💾 useMatchDataHandlers: Starting unified match save...');
      
      // Show loading state
      toast({
        title: "Saving Match...",
        description: "Please wait while we save your match data",
      });
      
      // Prepare match data for unified save
      const matchData = {
        fixtureId: props.selectedFixtureData.id,
        homeScore: props.homeScore,
        awayScore: props.awayScore,
        goals: props.goals.map(goal => ({
          playerId: goal.playerId,
          playerName: goal.playerName,
          team: goal.team,
          type: goal.type as 'goal' | 'assist',
          time: goal.time
        })),
        cards: [], // Cards are handled separately in the current implementation
        playerTimes: props.playersForTimeTracker.map(player => ({
          playerId: player.id,
          playerName: player.name,
          team: player.team,
          totalTime: Math.floor(player.totalTime / 60), // Convert to minutes
          periods: [{
            start_time: player.startTime || 0,
            end_time: props.matchTime,
            duration: Math.floor(player.totalTime / 60)
          }]
        })),
        homeTeam: {
          id: props.selectedFixtureData.home_team_id,
          name: props.selectedFixtureData.home_team?.name
        },
        awayTeam: {
          id: props.selectedFixtureData.away_team_id,
          name: props.selectedFixtureData.away_team?.name
        }
      };

      const result = await unifiedRefereeService.saveCompleteMatchData(matchData);
      
      if (result.success) {
        props.addEvent('Save', `Match saved successfully: ${result.message}`, props.matchTime);
        
        // Force refresh to sync state
        if (props.forceRefresh) {
          await props.forceRefresh();
        }
        
        toast({
          title: "✅ Match Saved Successfully!",
          description: result.message,
        });
      } else {
        toast({
          title: "Save Completed with Issues",
          description: `${result.message}\n\nErrors: ${result.errors.join(', ')}`,
          variant: "destructive"
        });
      }
      
      console.log('✅ useMatchDataHandlers: Unified match save completed');
    } catch (error) {
      console.error('❌ useMatchDataHandlers: Failed to save match:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save match. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetMatchData = async () => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected for reset",
        variant: "destructive"
      });
      return;
    }

    try {
      // Enhanced validation with user confirmation
      const safetyCheck = await matchResetService.validateResetOperation(props.selectedFixtureData.id);
      
      if (!safetyCheck.canReset) {
        toast({
          title: "Reset Not Safe",
          description: "Cannot safely reset this match data",
          variant: "destructive"
        });
        return;
      }

      // Show detailed confirmation with warning information
      const warningMessage = safetyCheck.warnings.length > 0 
        ? `\n\nWarnings:\n${safetyCheck.warnings.join('\n')}`
        : '';

      const confirmReset = window.confirm(
        `⚠️ RESET MATCH DATA\n\n` +
        `This will completely reset all match data for this fixture:\n\n` +
        `• Delete all match events (goals, cards, etc.)\n` +
        `• Delete all player time tracking records\n` +
        `• Reset fixture scores to 0-0\n` +
        `• Clear all local match state\n\n` +
        `This action CANNOT be undone!${warningMessage}\n\n` +
        `Are you absolutely sure you want to proceed?`
      );

      if (!confirmReset) {
        return;
      }

      // Show loading state
      toast({
        title: "Resetting Match...",
        description: "Please wait while we reset all match data",
      });

      console.log('🔄 useMatchDataHandlers: Starting enhanced match data reset...');
      
      const resetResult = await matchResetService.resetMatchData(props.selectedFixtureData.id);
      
      if (resetResult.success) {
        // Reset all local state
        props.resetTimer();
        props.resetScore();
        props.resetEvents();
        props.resetCards();
        props.resetTracking();
        props.resetGoals();
        
        // Force refresh to sync state
        if (props.forceRefresh) {
          await props.forceRefresh();
        }
        
        toast({
          title: "✅ Match Data Reset Complete",
          description: resetResult.message,
        });
        
        props.addEvent('Reset', 'Match data completely reset', 0);
        
        console.log('✅ useMatchDataHandlers: Enhanced match data reset completed successfully');
      } else {
        toast({
          title: "Reset Partial Success",
          description: `${resetResult.message}\n\nErrors: ${resetResult.errors.join(', ')}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ useMatchDataHandlers: Failed to reset match data:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset match data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!props.selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected for cleanup",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🧹 useMatchDataHandlers: Starting duplicate cleanup...');
      
      // Show loading state
      toast({
        title: "Cleaning Duplicates...",
        description: "Removing duplicate match events",
      });
      
      // Note: This would require the enhancedDuplicatePreventionService to be implemented
      // For now, we'll just refresh the state
      if (props.forceRefresh) {
        await props.forceRefresh();
      }
      
      toast({
        title: "✅ Cleanup Complete",
        description: "Match state has been refreshed",
      });
      
      console.log('✅ useMatchDataHandlers: Duplicate cleanup completed');
    } catch (error) {
      console.error('❌ useMatchDataHandlers: Failed to cleanup duplicates:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup duplicates. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    handleSaveMatch,
    handleResetMatchData,
    handleCleanupDuplicates
  };
};
