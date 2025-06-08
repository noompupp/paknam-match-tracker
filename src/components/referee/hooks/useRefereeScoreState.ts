
import { useState, useEffect } from "react";
import { useMatchStateSync } from "@/hooks/useMatchStateSync";

interface RefereeScoreStateProps {
  selectedFixtureData: any;
}

export const useRefereeScoreState = ({ selectedFixtureData }: RefereeScoreStateProps) => {
  // Database-driven score state (replacing legacy local state)
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Enhanced real-time score sync with immediate updates
  const { syncScoreFromEvents, forceRefresh } = useMatchStateSync({
    fixtureId: selectedFixtureData?.id,
    onScoreUpdate: (newHomeScore: number, newAwayScore: number) => {
      console.log('🔄 useRefereeScoreState: Real-time score update received:', {
        oldScores: { home: homeScore, away: awayScore },
        newScores: { home: newHomeScore, away: newAwayScore }
      });
      setHomeScore(newHomeScore);
      setAwayScore(newAwayScore);
    },
    onMatchEventUpdate: (event: any) => {
      console.log('🎯 useRefereeScoreState: Match event update received:', event);
      // Trigger immediate score sync when goals are added
      if (event.new?.event_type === 'goal') {
        console.log('⚽ useRefereeScoreState: Goal event detected, triggering immediate sync');
        syncScoreFromEvents();
      }
    }
  });

  // Initialize scores from database when fixture changes
  useEffect(() => {
    if (selectedFixtureData) {
      console.log('🔄 useRefereeScoreState: Initializing scores from fixture data:', {
        fixture: selectedFixtureData.id,
        homeScore: selectedFixtureData.home_score,
        awayScore: selectedFixtureData.away_score
      });
      
      setHomeScore(selectedFixtureData.home_score || 0);
      setAwayScore(selectedFixtureData.away_score || 0);
      
      // Trigger initial sync to ensure consistency
      syncScoreFromEvents();
    } else {
      setHomeScore(0);
      setAwayScore(0);
    }
  }, [selectedFixtureData?.id, selectedFixtureData?.home_score, selectedFixtureData?.away_score, syncScoreFromEvents]);

  // Database-driven score functions (replacing legacy local state functions)
  const addGoal = async (team: 'home' | 'away') => {
    if (team === 'home') {
      const newScore = homeScore + 1;
      setHomeScore(newScore);
      console.log('📊 useRefereeScoreState: Local home score updated to:', newScore);
    } else {
      const newScore = awayScore + 1;
      setAwayScore(newScore);
      console.log('📊 useRefereeScoreState: Local away score updated to:', newScore);
    }
  };

  const removeGoal = (team: 'home' | 'away') => {
    if (team === 'home' && homeScore > 0) {
      const newScore = homeScore - 1;
      setHomeScore(newScore);
      console.log('📊 useRefereeScoreState: Local home score decreased to:', newScore);
    } else if (team === 'away' && awayScore > 0) {
      const newScore = awayScore - 1;
      setAwayScore(newScore);
      console.log('📊 useRefereeScoreState: Local away score decreased to:', newScore);
    }
  };

  const resetScore = () => {
    console.log('🔄 useRefereeScoreState: Resetting scores to 0-0');
    setHomeScore(0);
    setAwayScore(0);
  };

  return {
    // Database-driven score state with real-time sync
    homeScore,
    awayScore,
    addGoal,
    removeGoal,
    resetScore,
    forceRefresh // Enhanced refresh function for immediate sync
  };
};
