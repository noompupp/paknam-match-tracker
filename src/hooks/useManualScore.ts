
import { useState, useEffect, useCallback } from 'react';
import { useManualDataFetch } from './useManualDataFetch';

interface ManualScoreProps {
  fixtureId?: number;
  onScoreUpdate?: (homeScore: number, awayScore: number) => void;
}

export const useManualScore = ({ fixtureId, onScoreUpdate }: ManualScoreProps) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { calculateScoreFromEvents, manualRefresh, isRefreshing } = useManualDataFetch({ fixtureId });

  // Fetch initial scores when fixture changes
  const fetchInitialScores = useCallback(async () => {
    if (!fixtureId) {
      setHomeScore(0);
      setAwayScore(0);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 useManualScore: Fetching initial scores for fixture:', fixtureId);
      
      const { homeScore: newHome, awayScore: newAway } = await calculateScoreFromEvents(fixtureId);
      
      setHomeScore(newHome);
      setAwayScore(newAway);

      // Notify parent component
      if (onScoreUpdate) {
        onScoreUpdate(newHome, newAway);
      }

      console.log('✅ useManualScore: Initial scores loaded:', { homeScore: newHome, awayScore: newAway });
    } catch (error) {
      console.error('❌ useManualScore: Error fetching initial scores:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fixtureId, calculateScoreFromEvents, onScoreUpdate]);

  // Load scores when fixture changes
  useEffect(() => {
    fetchInitialScores();
  }, [fetchInitialScores]);

  // Manual refresh with score update
  const refreshScores = useCallback(async () => {
    if (!fixtureId) return;

    try {
      const result = await manualRefresh();
      if (result?.scoreData) {
        setHomeScore(result.scoreData.homeScore);
        setAwayScore(result.scoreData.awayScore);
        
        if (onScoreUpdate) {
          onScoreUpdate(result.scoreData.homeScore, result.scoreData.awayScore);
        }
      }
    } catch (error) {
      console.error('❌ useManualScore: Error refreshing scores:', error);
    }
  }, [fixtureId, manualRefresh, onScoreUpdate]);

  return {
    homeScore,
    awayScore,
    isLoading: isLoading || isRefreshing,
    refreshScores,
    fetchInitialScores
  };
};
