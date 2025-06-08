
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMatchStateSync } from "./useMatchStateSync";

interface RealTimeScoreProps {
  fixtureId?: number;
}

export const useRealTimeScore = (props?: RealTimeScoreProps) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Enhanced score update handler
  const handleScoreUpdate = (newHomeScore: number, newAwayScore: number) => {
    console.log('📊 useRealTimeScore: Score updated via sync:', { newHomeScore, newAwayScore });
    setHomeScore(newHomeScore);
    setAwayScore(newAwayScore);
  };

  // Enhanced match event handler
  const handleMatchEventUpdate = (event: any) => {
    console.log('🎯 useRealTimeScore: Match event updated:', event);
    
    // Show toast for goal events
    if (event.new?.event_type === 'goal') {
      toast({
        title: "⚽ Goal Scored!",
        description: `${event.new.player_name || 'Quick Goal'} scored!`,
      });
    }
  };

  // Use the match state sync hook
  const { syncScoreFromEvents, forceRefresh } = useMatchStateSync({
    fixtureId: props?.fixtureId,
    onScoreUpdate: handleScoreUpdate,
    onMatchEventUpdate: handleMatchEventUpdate
  });

  // Fetch initial score from database
  const fetchInitialScore = async (fixtureId: number) => {
    setIsLoading(true);
    try {
      console.log('🔄 useRealTimeScore: Fetching initial score for fixture:', fixtureId);
      
      // Trigger sync to ensure scores are up to date
      await syncScoreFromEvents();
      
    } catch (error) {
      console.error('❌ useRealTimeScore: Error in fetchInitialScore:', error);
      toast({
        title: "Score Sync Error",
        description: "Failed to sync score data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize score when fixture changes
  useEffect(() => {
    if (props?.fixtureId) {
      fetchInitialScore(props.fixtureId);
    } else {
      console.log('⚠️ useRealTimeScore: No fixture ID provided, resetting scores');
      setHomeScore(0);
      setAwayScore(0);
    }
  }, [props?.fixtureId]);

  // Manual refresh function
  const refreshScore = () => {
    if (props?.fixtureId) {
      console.log('🔄 useRealTimeScore: Manual score refresh requested');
      fetchInitialScore(props.fixtureId);
    }
  };

  // Legacy compatibility functions (deprecated but maintained for backward compatibility)
  const addGoal = (team: 'home' | 'away') => {
    console.log('⚠️ useRealTimeScore: Legacy addGoal called - scores are now managed by database');
    if (team === 'home') {
      setHomeScore(prev => prev + 1);
    } else {
      setAwayScore(prev => prev + 1);
    }
  };

  const removeGoal = (team: 'home' | 'away') => {
    console.log('⚠️ useRealTimeScore: Legacy removeGoal called - scores are now managed by database');
    if (team === 'home' && homeScore > 0) {
      setHomeScore(prev => prev - 1);
    } else if (team === 'away' && awayScore > 0) {
      setAwayScore(prev => prev - 1);
    }
  };

  const resetScore = () => {
    console.log('🔄 useRealTimeScore: Resetting scores to 0');
    setHomeScore(0);
    setAwayScore(0);
  };

  return {
    homeScore,
    awayScore,
    isLoading,
    addGoal, // Legacy compatibility
    removeGoal, // Legacy compatibility
    resetScore,
    refreshScore,
    forceRefresh // New enhanced refresh
  };
};
