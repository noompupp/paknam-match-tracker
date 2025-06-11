
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StableScoreSyncProps {
  fixtureId?: number;
  onScoreUpdate?: (homeScore: number, awayScore: number) => void;
}

export const useStableScoreSync = ({ fixtureId, onScoreUpdate }: StableScoreSyncProps) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Manual sync management (no debouncing for manual actions)
  const lastSyncRef = useRef<number>(0);

  // Manual score calculation from events
  const calculateScoreFromEvents = useCallback(async (targetFixtureId: number) => {
    try {
      console.log('🔄 useStableScoreSync: Manual score calculation for fixture:', targetFixtureId);
      
      // Get fixture data first to know team IDs
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('home_team_id, away_team_id, home_score, away_score')
        .eq('id', targetFixtureId)
        .single();

      if (fixtureError || !fixture) {
        console.error('❌ useStableScoreSync: Error fetching fixture:', fixtureError);
        return { homeScore: 0, awayScore: 0 };
      }

      // Count goals for each team
      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('team_id, event_type')
        .eq('fixture_id', targetFixtureId)
        .eq('event_type', 'goal');

      if (eventsError) {
        console.error('❌ useStableScoreSync: Error fetching events:', eventsError);
        return { homeScore: fixture.home_score || 0, awayScore: fixture.away_score || 0 };
      }

      const homeGoals = events?.filter(event => event.team_id === fixture.home_team_id).length || 0;
      const awayGoals = events?.filter(event => event.team_id === fixture.away_team_id).length || 0;

      console.log('📊 useStableScoreSync: Manual scores calculated:', { 
        homeGoals, 
        awayGoals,
        fixtureScores: { home: fixture.home_score, away: fixture.away_score }
      });

      return { homeScore: homeGoals, awayScore: awayGoals };

    } catch (error) {
      console.error('❌ useStableScoreSync: Error in manual score calculation:', error);
      return { homeScore: 0, awayScore: 0 };
    }
  }, []);

  // Manual score sync function
  const manualScoreSync = useCallback(async (targetFixtureId: number) => {
    setIsLoading(true);
    try {
      const { homeScore: newHome, awayScore: newAway } = await calculateScoreFromEvents(targetFixtureId);
      
      // Update scores
      setHomeScore(newHome);
      setAwayScore(newAway);

      // Notify parent component
      if (onScoreUpdate) {
        onScoreUpdate(newHome, newAway);
      }

      lastSyncRef.current = Date.now();
      console.log('✅ useStableScoreSync: Manual sync completed:', { homeScore: newHome, awayScore: newAway });
      
    } catch (error) {
      console.error('❌ useStableScoreSync: Error in manual sync:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateScoreFromEvents, onScoreUpdate]);

  // Initialize scores when fixture changes
  useEffect(() => {
    if (!fixtureId) {
      console.log('⚠️ useStableScoreSync: No fixture ID, resetting scores');
      setHomeScore(0);
      setAwayScore(0);
      return;
    }

    console.log('🔄 useStableScoreSync: Manual initialization for fixture:', fixtureId);
    manualScoreSync(fixtureId);
  }, [fixtureId, manualScoreSync]);

  // Manual refresh function
  const forceRefresh = useCallback(() => {
    if (fixtureId) {
      console.log('🔄 useStableScoreSync: Manual force refresh requested');
      manualScoreSync(fixtureId);
    }
  }, [fixtureId, manualScoreSync]);

  return {
    homeScore,
    awayScore,
    isLoading,
    forceRefresh
  };
};
