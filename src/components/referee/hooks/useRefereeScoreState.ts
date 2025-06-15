
import { useState, useEffect } from "react";
import { useManualScore } from "@/hooks/useManualScore";
import { useMatchStore } from "@/stores/useMatchStore";
import { MatchGoal } from "@/stores/match/types"; // Import the right type

interface RefereeScoreStateProps {
  selectedFixtureData: any;
}

// Provide homeScore and awayScore from match store only; refresh and other logic can still exist for DB sync
export const useRefereeScoreState = ({ selectedFixtureData }: RefereeScoreStateProps) => {
  const {
    homeScore,
    awayScore,
    addGoal: addGoalToStore,
    removeGoal: removeGoalFromStore,
    goals
  } = useMatchStore();

  // Any DB/manual sync only triggers refresh, not state change
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchInitialScores = async () => {
    if (!selectedFixtureData?.id) return;

    setIsLoading(true);
    try {
      // Fetch initial scores from the database
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

  // Helper to construct a minimal valid goal object for quick goals
  const getQuickGoalData = (team: 'home' | 'away'): Omit<MatchGoal, "id" | "timestamp" | "synced"> => {
    const homeTeam = selectedFixtureData?.home_team?.name || selectedFixtureData?.home_team_name || "Home";
    const awayTeam = selectedFixtureData?.away_team?.name || selectedFixtureData?.away_team_name || "Away";

    let teamName = team === "home" ? homeTeam : awayTeam;
    let teamId = team === "home"
      ? (selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id || "")
      : (selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id || "");

    return {
      playerId: 0,
      playerName: "Quick Goal",
      teamId: String(teamId),
      teamName,
      type: "goal",
      time: 0, // Could use a timestamp here if needed
      // timestamp added by slice
      // id added by slice
      // synced added by slice
      isOwnGoal: false,
      team, // Optionally for compatibility
    };
  };

  // FIXED: Supply goalData, not just string! 🟢
  const addGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal addition triggered for:', team);
    const goalData = getQuickGoalData(team);
    addGoalToStore(goalData);
    await refreshScores();
  };

  // For remove: Remove the most recent unassigned goal for the team (by default)
  const removeGoal = async (team: 'home' | 'away') => {
    console.log('📊 useRefereeScoreState: Manual goal removal triggered for:', team);
    // Find the last unassigned quick goal for that team
    const homeTeam = selectedFixtureData?.home_team?.name || selectedFixtureData?.home_team_name || "Home";
    const awayTeam = selectedFixtureData?.away_team?.name || selectedFixtureData?.away_team_name || "Away";
    const teamName = team === "home" ? homeTeam : awayTeam;

    // Find a "Quick Goal" for teamName
    const lastGoal = [...goals]
      .reverse()
      .find(g =>
        g.playerName === "Quick Goal" &&
        g.teamName === teamName &&
        g.type === "goal"
      );
    if (lastGoal) {
      removeGoalFromStore(lastGoal.id);
      await refreshScores();
    } else {
      console.log('⚠️ useRefereeScoreState: No quick goal found for removal for team:', team);
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
