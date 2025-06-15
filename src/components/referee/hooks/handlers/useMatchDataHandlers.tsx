import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { PlayerTimeTrackerPlayer } from "../useRefereeState";
import { unifiedRefereeService } from "@/services/fixtures";
import { matchResetService } from "@/services/fixtures";
import { useResetState } from "@/hooks/useResetState";
import { useMatchSaveStatus } from "../useMatchSaveStatus";
import React from "react";
import ResetMatchConfirmationDialog from "@/components/referee/components/ResetMatchConfirmationDialog";

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
  forceRefresh?: () => Promise<void>;
}

export const useMatchDataHandlers = (props: UseMatchDataHandlersProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const resetState = useResetState({ fixtureId: props.selectedFixtureData?.id });

  // Add saving status context API
  const { setPhase, reset: resetSaveStatus } = useMatchSaveStatus();

  const handleSaveMatch = async () => {
    if (!props.selectedFixtureData) return;
    
    props.setSaveAttempts(prev => prev + 1);
    
    try {
      setPhase("validating", { statusMessage: "Validating match data..." });
      console.log('💾 useMatchDataHandlers: Starting unified match save...');
      
      toast({
        title: "Saving Match...",
        description: "Please wait while we save your match data",
      });
      
      setPhase("saving", { statusMessage: "Saving match and player statistics...", progress: 20 });

      const matchData = {
        fixtureId: props.selectedFixtureData.id,
        homeScore: props.homeScore,
        awayScore: props.awayScore,
        goals: props.goals.map(goal => ({
          playerId: goal.playerId,
          playerName: goal.playerName,
          team: goal.team,
          type: goal.type as 'goal' | 'assist',
          time: goal.time,
          isOwnGoal: goal.isOwnGoal || false
        })),
        cards: [],
        playerTimes: props.playersForTimeTracker.map(player => ({
          playerId: player.id,
          playerName: player.name,
          team: player.team,
          totalTime: Math.floor(player.totalTime / 60),
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

      setPhase("saving", { statusMessage: "Saving match to server ...", progress: 40 });

      const result = await unifiedRefereeService.saveCompleteMatchData(matchData);
      
      if (result.success) {
        setPhase("cache", { statusMessage: "Syncing cache...", progress: 70 });
        props.addEvent('Save', `Match saved successfully: ${result.message}`, props.matchTime);
        
        // Enhanced cache invalidation
        await queryClient.invalidateQueries({ 
          queryKey: ['fixtures'] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['match_events'] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['enhancedMatchSummary', props.selectedFixtureData.id] 
        });
        
        // Clear reset state after successful save
        resetState.clearResetState();
        
        if (props.forceRefresh) {
          setPhase("refreshing", { statusMessage: "Refreshing local data...", progress: 85 });
          await props.forceRefresh();
        }
        
        setPhase("success", { statusMessage: result.message, progress: 100 });
        setTimeout(resetSaveStatus, 1500);
        
        toast({
          title: "✅ Match Saved Successfully!",
          description: result.message,
        });
      } else {
        setPhase("error", { statusMessage: "Save completed with errors", errorMessage: (result.errors && result.errors[0]) || "Unknown error", progress: 100 });
        toast({
          title: "Save Completed with Issues",
          description: `${result.message}\n\nErrors: ${result.errors.join(', ')}`,
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      setPhase("error", { statusMessage: "Critical save failure", errorMessage: error?.message || "Unknown error", progress: 100 });
      console.error('❌ useMatchDataHandlers: Failed to save match:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save match. Please try again.",
        variant: "destructive"
      });
    }
  };

  // ---- Dialog state for Reset confirmation ----
  // We expose this out for the UI to open dialog, and capture the user's choice.
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [resetDialogWarnings, setResetDialogWarnings] = React.useState<string[]>([]);
  const [resetDialogPromise, setResetDialogPromise] = React.useState<{
    resolve: (confirmed: boolean) => void;
    reject: (err: any) => void;
  } | null>(null);
  const [resetDialogLoading, setResetDialogLoading] = React.useState(false);

  // Utility: Show dialog and return a Promise when confirmed
  const showResetDialog = (warnings?: string[]): Promise<boolean> => {
    setResetDialogWarnings(warnings || []);
    setResetDialogOpen(true);
    setResetDialogLoading(false);
    return new Promise((resolve, reject) => {
      setResetDialogPromise({ resolve, reject });
    });
  };

  // Handler for dialog cancellation
  const handleDialogCancel = () => {
    setResetDialogOpen(false);
    setResetDialogLoading(false);
    if (resetDialogPromise) resetDialogPromise.resolve(false);
    setResetDialogPromise(null);
  };
  // Handler for dialog confirmation
  const handleDialogConfirm = () => {
    setResetDialogLoading(true);
    setResetDialogOpen(false);
    if (resetDialogPromise) resetDialogPromise.resolve(true);
    setResetDialogPromise(null);
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
      setPhase("validating", { statusMessage: "Checking if reset is safe...", progress: 5 });
      const safetyCheck = await matchResetService.validateResetOperation(props.selectedFixtureData.id);
      
      if (!safetyCheck.canReset) {
        setPhase("error", { statusMessage: "Cannot safely reset this match (blocked by server)", progress: 100 });
        toast({
          title: "Reset Not Safe",
          description: "Cannot safely reset this match data",
          variant: "destructive"
        });
        return;
      }

      const warningMessage = safetyCheck.warnings.length > 0 
        ? `\n\nWarnings:\n${safetyCheck.warnings.join('\n')}`
        : '';

      // --- Replace window.confirm with dialog ---
      const userConfirmed = await showResetDialog(safetyCheck.warnings);
      if (!userConfirmed) {
        resetSaveStatus();
        return;
      }

      // --- Continue as before if user confirmed ---
      resetState.startReset(props.selectedFixtureData.id);
      setPhase("saving", { statusMessage: "Resetting match data...", progress: 25 });

      toast({
        title: "Resetting Match...",
        description: "Please wait while we reset all match data",
      });

      // Immediate UI feedback for local state
      setPhase("saving", { statusMessage: "Resetting UI...", progress: 35 });
      props.resetTimer();
      props.resetScore();
      props.resetEvents();
      props.resetCards();
      props.resetTracking();
      props.resetGoals();
      
      setPhase("saving", { statusMessage: "Resetting database...", progress: 65 });
      const resetResult = await matchResetService.resetMatchData(props.selectedFixtureData.id);
      
      if (resetResult.success) {
        resetState.completeReset(resetResult.timestamp);
        setPhase("cache", { statusMessage: "Clearing cache...", progress: 80 });

        await queryClient.invalidateQueries({ 
          queryKey: ['fixtures'] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['match_events'] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['enhancedMatchSummary', props.selectedFixtureData.id] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['enhancedMatchSummaryWithTeams', props.selectedFixtureData.id] 
        });
        await queryClient.removeQueries({
          queryKey: ['enhancedMatchSummary', props.selectedFixtureData.id]
        });
        
        if (props.forceRefresh) {
          setPhase("refreshing", { statusMessage: "Refreshing local data...", progress: 90 });
          await props.forceRefresh();
        }
        
        setPhase("success", { statusMessage: "Match Data Reset Complete", progress: 100 });
        setTimeout(resetSaveStatus, 1500);
        
        toast({
          title: "✅ Match Data Reset Complete",
          description: "All match data has been cleared and UI refreshed",
        });
        
        props.addEvent('Reset', 'Match data completely reset with state coordination', 0);
        
        console.log('✅ useMatchDataHandlers: Enhanced match data reset completed successfully');
      } else {
        resetState.clearResetState();
        setPhase("error", { statusMessage: "Reset partial success", errorMessage: resetResult.message, progress: 100 });
        toast({
          title: "Reset Partial Success",
          description: `${resetResult.message}\n\nErrors: ${resetResult.errors.join(', ')}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      resetState.clearResetState();
      setPhase("error", { statusMessage: "Reset failed", errorMessage: error?.message || "Unknown error", progress: 100 });
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
      
      toast({
        title: "Cleaning Duplicates...",
        description: "Removing duplicate match events",
      });
      
      // Enhanced cache invalidation
      await queryClient.invalidateQueries({ 
        queryKey: ['fixtures'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['match_events'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['enhancedMatchSummary', props.selectedFixtureData.id] 
      });
      
      if (props.forceRefresh) {
        await props.forceRefresh();
      }
      
      toast({
        title: "✅ Cleanup Complete",
        description: "Match state has been refreshed and cache cleared",
      });
      
    } catch (error) {
      console.error('❌ useMatchDataHandlers: Failed to cleanup duplicates:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup duplicates. Please try again.",
        variant: "destructive"
      });
    }
  };

  // ---- Dialog component (consumer must render this!) ----
  const ResetDialog = (
    <ResetMatchConfirmationDialog
      open={resetDialogOpen}
      warningLines={resetDialogWarnings}
      onCancel={handleDialogCancel}
      onConfirm={handleDialogConfirm}
      loading={resetDialogLoading}
    />
  );

  // ---- Return the dialog to be rendered by consumer along with handlers. ----
  return {
    handleSaveMatch,
    handleResetMatchData,
    handleCleanupDuplicates,
    resetState, // Expose reset state for coordination
    ResetDialog // Consumer must render this within their component tree
  };
};
