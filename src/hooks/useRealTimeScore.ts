
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useManualScore } from "./useManualScore";

interface RealTimeScoreProps {
  fixtureId?: number;
}

export const useRealTimeScore = (props?: RealTimeScoreProps) => {
  const { toast } = useToast();

  // Use manual score management instead of real-time sync
  const { homeScore, awayScore, isLoading, refreshScores, fetchInitialScores } = useManualScore({
    fixtureId: props?.fixtureId,
    onScoreUpdate: (newHomeScore: number, newAwayScore: number) => {
      console.log('📊 useRealTimeScore: Manual score updated:', { newHomeScore, newAwayScore });
    }
  });

  // Manual refresh function
  const refreshScore = async () => {
    if (props?.fixtureId) {
      console.log('🔄 useRealTimeScore: Manual score refresh requested');
      try {
        await refreshScores();
        toast({
          title: "Scores Refreshed",
          description: "Match scores have been updated",
        });
      } catch (error) {
        console.error('❌ useRealTimeScore: Error refreshing scores:', error);
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh scores",
          variant: "destructive"
        });
      }
    }
  };

  // Enhanced force refresh with user feedback
  const forceRefresh = async () => {
    console.log('🔄 useRealTimeScore: Enhanced force refresh requested');
    await refreshScore();
  };

  // Legacy compatibility functions (maintained for backward compatibility)
  const addGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRealTimeScore: Legacy addGoal called - triggering manual refresh');
    await refreshScores();
  };

  const removeGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRealTimeScore: Legacy removeGoal called - triggering manual refresh');
    await refreshScores();
  };

  const resetScore = async () => {
    console.log('🔄 useRealTimeScore: Resetting scores and fetching fresh data');
    await fetchInitialScores();
  };

  return {
    homeScore,
    awayScore,
    isLoading,
    addGoal,
    removeGoal, 
    resetScore,
    refreshScore,
    forceRefresh
  };
};
