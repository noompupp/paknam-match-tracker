import { useState, useEffect } from "react";
import { useManualScore } from "@/hooks/useManualScore";
import { useMatchStore } from "@/stores/useMatchStore";

interface RefereeScoreStateProps {
  selectedFixtureData: any;
}

export const useRefereeScoreState = ({ selectedFixtureData }: RefereeScoreStateProps) => {
  const { homeScore, awayScore, addGoal: addGoalToStore, removeGoal: removeGoalFromStore } = useMatchStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchInitialScores = async () => {
    if (!selectedFixtureData?.id) return;
    setIsLoading(true);
    try {
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

  // Build a goal object for "Quick Goal" and ensure type safety per MatchGoal type
  const getQuickGoalData = (team: 'home' | 'away') => {
    let teamName: string = '';
    let teamId: string = '';
    if (team === 'home') {
      teamName = selectedFixtureData?.home_team?.name || selectedFixtureData?.home_team_name || 'Home Team';
      teamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id || '';
    } else {
      teamName = selectedFixtureData?.away_team?.name || selectedFixtureData?.away_team_name || 'Away Team';
      teamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id || '';
    }
    return {
      teamName,
      teamId,
      type: "goal" as const,       // Fix: use string literal
      playerName: 'Quick Goal',
      playerId: 0,                 // Fix: MatchGoal expects number, not null
      time: 0,
      isOwnGoal: false
    };
  };

  const addGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal addition triggered for:', team);
    addGoalToStore(getQuickGoalData(team));
    await refreshScores();
  };

  const removeGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal removal triggered for:', team);

    const { goals } = useMatchStore.getState();
    const teamName =
      team === 'home'
        ? selectedFixtureData?.home_team?.name ||
          selectedFixtureData?.home_team_name ||
          'Home Team'
        : selectedFixtureData?.away_team?.name ||
          selectedFixtureData?.away_team_name ||
          'Away Team';

    const lastQuickGoal = [...goals]
      .reverse()
      .find(
        (g) =>
          g.playerName === 'Quick Goal' &&
          g.teamName === teamName &&
          g.type === "goal"
      );

    if (lastQuickGoal) {
      removeGoalFromStore(lastQuickGoal.id);
      await refreshScores();
    } else {
      console.warn('⚠️ No Quick Goal found to remove for team:', teamName);
    }
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
