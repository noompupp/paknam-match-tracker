
import { useState, useEffect } from "react";
import { useManualScore } from "@/hooks/useManualScore";

interface RefereeScoreStateProps {
  selectedFixtureData: any;
}

export const useRefereeScoreState = ({ selectedFixtureData }: RefereeScoreStateProps) => {
  // Manual score management (replacing real-time sync)
  const { homeScore, awayScore, isLoading, refreshScores, fetchInitialScores } = useManualScore({
    fixtureId: selectedFixtureData?.id,
    onScoreUpdate: (newHomeScore: number, newAwayScore: number) => {
      console.log('🔄 useRefereeScoreState: Manual score update received:', {
        oldScores: { home: homeScore, away: awayScore },
        newScores: { home: newHomeScore, away: newAwayScore }
      });
    }
  });

  // Manual score functions (replacing database-driven functions)
  const addGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal addition triggered for:', team);
    // Refresh scores after goal is added to database
    await refreshScores();
  };

  const removeGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal removal triggered for:', team);
    // Refresh scores after goal is removed from database
    await refreshScores();
  };

  const resetScore = async () => {
    console.log('🔄 useRefereeScoreState: Manual score reset triggered');
    await fetchInitialScores();
  };

  const forceRefresh = async () => {
    console.log('🔄 useRefereeScoreState: Manual force refresh triggered');
    await refreshScores();
  };

  return {
    // Manual score state with manual refresh capabilities
    homeScore,
    awayScore,
    isLoading,
    addGoal,
    removeGoal,
    resetScore,
    forceRefresh
  };
};
