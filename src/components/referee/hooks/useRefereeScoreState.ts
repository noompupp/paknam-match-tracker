
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
    console.log('🔔 Score state after addGoal refresh:', { homeScore, awayScore });
  };

  const removeGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal removal triggered for:', team);
    // Refresh scores after goal is removed from database
    await refreshScores();
    console.log('🔔 Score state after removeGoal refresh:', { homeScore, awayScore });
  };

  const resetScore = async () => {
    console.log('🔄 useRefereeScoreState: Manual score reset triggered');
    await fetchInitialScores();
    console.log('🔔 Score state after resetScore:', { homeScore, awayScore });
  };

  // forceRefresh always available and does a full score refresh
  const forceRefresh = async () => {
    console.log('🔄 useRefereeScoreState: Manual force refresh triggered');
    await refreshScores();
    console.log('🔔 forceRefresh result (should be immediate):', { homeScore, awayScore });
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

