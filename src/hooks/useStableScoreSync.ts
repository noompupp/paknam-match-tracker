
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
  
  // Prevent race conditions with debouncing
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  // Stable score calculation from events
  const calculateScoreFromEvents = useCallback(async (targetFixtureId: number) => {
    try {
      console.log('🔄 useStableScoreSync: Calculating score from events for fixture:', targetFixtureId);
      
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

      console.log('📊 useStableScoreSync: Calculated scores from events:', { 
        homeGoals, 
        awayGoals,
        fixtureScores: { home: fixture.home_score, away: fixture.away_score }
      });

      return { homeScore: homeGoals, awayScore: awayGoals };

    } catch (error) {
      console.error('❌ useStableScoreSync: Error in calculateScoreFromEvents:', error);
      return { homeScore: 0, awayScore: 0 };
    }
  }, []);

  // Debounced score sync to prevent race conditions
  const debouncedScoreSync = useCallback(async (targetFixtureId: number, delay = 300) => {
    // Clear any existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Prevent too frequent syncs
    const now = Date.now();
    if (now - lastSyncRef.current < 100) {
      console.log('⏰ useStableScoreSync: Skipping sync - too frequent');
      return;
    }

    syncTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { homeScore: newHome, awayScore: newAway } = await calculateScoreFromEvents(targetFixtureId);
        
        // Only update if scores actually changed
        setHomeScore(current => {
          if (current !== newHome) {
            console.log('📊 useStableScoreSync: Home score updated:', current, '->', newHome);
            return newHome;
          }
          return current;
        });
        
        setAwayScore(current => {
          if (current !== newAway) {
            console.log('📊 useStableScoreSync: Away score updated:', current, '->', newAway);
            return newAway;
          }
          return current;
        });

        // Notify parent component
        if (onScoreUpdate) {
          onScoreUpdate(newHome, newAway);
        }

        lastSyncRef.current = Date.now();
        
      } catch (error) {
        console.error('❌ useStableScoreSync: Error in debounced sync:', error);
      } finally {
        setIsLoading(false);
      }
    }, delay);
  }, [calculateScoreFromEvents, onScoreUpdate]);

  // Initialize scores when fixture changes
  useEffect(() => {
    if (!fixtureId) {
      console.log('⚠️ useStableScoreSync: No fixture ID, resetting scores');
      setHomeScore(0);
      setAwayScore(0);
      isInitializedRef.current = false;
      return;
    }

    console.log('🔄 useStableScoreSync: Initializing for fixture:', fixtureId);
    isInitializedRef.current = true;
    debouncedScoreSync(fixtureId, 100); // Faster initial sync
  }, [fixtureId, debouncedScoreSync]);

  // Set up real-time subscriptions with stable handling
  useEffect(() => {
    if (!fixtureId || !isInitializedRef.current) return;

    console.log('🔗 useStableScoreSync: Setting up real-time subscription for fixture:', fixtureId);

    const channel = supabase
      .channel(`stable-score-sync-${fixtureId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_events',
          filter: `fixture_id=eq.${fixtureId}`
        },
        (payload) => {
          console.log('🎯 useStableScoreSync: Match event changed:', payload);
          
          const event = payload.new as any;
          if (event?.event_type === 'goal') {
            console.log('⚽ useStableScoreSync: Goal event detected, triggering stable sync');
            debouncedScoreSync(fixtureId, 500); // Slightly longer delay for goal events
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 useStableScoreSync: Cleaning up subscription');
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [fixtureId, debouncedScoreSync]);

  // Manual refresh function
  const forceRefresh = useCallback(() => {
    if (fixtureId) {
      console.log('🔄 useStableScoreSync: Force refresh requested');
      debouncedScoreSync(fixtureId, 100);
    }
  }, [fixtureId, debouncedScoreSync]);

  return {
    homeScore,
    awayScore,
    isLoading,
    forceRefresh
  };
};
