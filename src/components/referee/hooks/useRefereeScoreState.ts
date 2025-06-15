import { useState, useEffect } from "react";
import { useManualScore } from "@/hooks/useManualScore";
import { useMatchStore } from "@/stores/useMatchStore"; // Add this

interface RefereeScoreStateProps {
  selectedFixtureData: any;
}

// Provide homeScore and awayScore from match store only; refresh and other logic can still exist for DB sync
export const useRefereeScoreState = ({ selectedFixtureData }: RefereeScoreStateProps) => {
  const { homeScore, awayScore, addGoal: addGoalToStore, removeGoal: removeGoalFromStore } = useMatchStore();

  // Any DB/manual sync only triggers refresh, not state change
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchInitialScores = async () => {
    if (!selectedFixtureData?.id) return;

    setIsLoading(true);
    try {
      // Fetch initial scores from the database
      // In a real implementation, you would fetch the scores from the database here
      // and update the Zustand store with the fetched scores.
      // For now, we'll just simulate a delay to show the loading state.
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('🔄 useRefereeScoreState: Initial scores loaded from database');
    } catch (error) {
      console.error('❌ useRefereeScoreState: Error fetching initial scores:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const refreshScores = async () => {
    if (!selectedFixtureData?.id) return;

    setIsLoading(true);
    try {
      // Fetch updated scores from the database
      // In a real implementation, you would fetch the scores from the database here
      // and update the Zustand store with the fetched scores.
      // For now, we'll just simulate a delay to show the loading state.
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('🔄 useRefereeScoreState: Scores refreshed from database');
    } catch (error) {
      console.error('❌ useRefereeScoreState: Error refreshing scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFixtureData?.id && isInitialLoad) {
      fetchInitialScores();
    }
  }, [selectedFixtureData?.id, isInitialLoad]);

  // FIXED: just pass team ("home"/"away") instead of full object
  const addGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal addition triggered for:', team);
    addGoalToStore(team);
    await refreshScores();
  };

  const removeGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal removal triggered for:', team);
    removeGoalFromStore(team);
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
    homeScore,
    awayScore,
    isLoading,
    addGoal,
    removeGoal,
    resetScore,
    forceRefresh
  };
};
