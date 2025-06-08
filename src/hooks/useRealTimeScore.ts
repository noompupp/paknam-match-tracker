
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RealTimeScoreProps {
  fixtureId?: number;
}

export const useRealTimeScore = (props?: RealTimeScoreProps) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calculate score from match events as fallback
  const calculateScoreFromEvents = async (fixtureId: number, homeTeamId: string, awayTeamId: string) => {
    try {
      const { data: events, error } = await supabase
        .from('match_events')
        .select('team_id, event_type')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal');

      if (error) {
        console.error('❌ useRealTimeScore: Error fetching events for score calculation:', error);
        return { homeScore: 0, awayScore: 0 };
      }

      const homeGoals = events?.filter(event => event.team_id === homeTeamId).length || 0;
      const awayGoals = events?.filter(event => event.team_id === awayTeamId).length || 0;

      console.log('📊 useRealTimeScore: Calculated score from events:', {
        fixtureId,
        homeTeamId,
        awayTeamId,
        homeGoals,
        awayGoals,
        totalEvents: events?.length
      });

      return { homeScore: homeGoals, awayScore: awayGoals };
    } catch (error) {
      console.error('❌ useRealTimeScore: Error in score calculation:', error);
      return { homeScore: 0, awayScore: 0 };
    }
  };

  // Fetch initial score from database
  const fetchInitialScore = async (fixtureId: number) => {
    setIsLoading(true);
    try {
      console.log('🔄 useRealTimeScore: Fetching initial score for fixture:', fixtureId);
      
      const { data: fixture, error } = await supabase
        .from('fixtures')
        .select('home_score, away_score, home_team_id, away_team_id')
        .eq('id', fixtureId)
        .single();

      if (error) {
        console.error('❌ useRealTimeScore: Error fetching fixture:', error);
        toast({
          title: "Score Sync Error",
          description: "Failed to fetch current score",
          variant: "destructive"
        });
        return;
      }

      if (fixture) {
        // Use database scores if available, otherwise calculate from events
        if (fixture.home_score !== null && fixture.away_score !== null) {
          console.log('✅ useRealTimeScore: Using database scores:', {
            homeScore: fixture.home_score,
            awayScore: fixture.away_score
          });
          setHomeScore(fixture.home_score);
          setAwayScore(fixture.away_score);
        } else {
          console.log('📊 useRealTimeScore: Database scores null, calculating from events');
          const calculated = await calculateScoreFromEvents(
            fixtureId, 
            fixture.home_team_id, 
            fixture.away_team_id
          );
          setHomeScore(calculated.homeScore);
          setAwayScore(calculated.awayScore);
        }
      }
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

  // Set up real-time subscription
  useEffect(() => {
    if (!props?.fixtureId) {
      console.log('⚠️ useRealTimeScore: No fixture ID provided, skipping subscription');
      return;
    }

    console.log('🔗 useRealTimeScore: Setting up real-time subscription for fixture:', props.fixtureId);

    // Fetch initial score
    fetchInitialScore(props.fixtureId);

    // Set up real-time listeners
    const fixtureChannel = supabase
      .channel('fixture-score-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fixtures',
          filter: `id=eq.${props.fixtureId}`
        },
        (payload) => {
          console.log('🔄 useRealTimeScore: Fixture updated:', payload);
          const newData = payload.new as any;
          if (newData.home_score !== null && newData.away_score !== null) {
            setHomeScore(newData.home_score);
            setAwayScore(newData.away_score);
            console.log('✅ useRealTimeScore: Score updated from fixture change:', {
              homeScore: newData.home_score,
              awayScore: newData.away_score
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_events',
          filter: `fixture_id=eq.${props.fixtureId}`
        },
        async (payload) => {
          console.log('🎯 useRealTimeScore: New match event:', payload);
          const newEvent = payload.new as any;
          
          // If it's a goal event, recalculate scores
          if (newEvent.event_type === 'goal') {
            console.log('⚽ useRealTimeScore: Goal event detected, recalculating scores');
            
            // Get fixture data for team IDs
            const { data: fixture } = await supabase
              .from('fixtures')
              .select('home_team_id, away_team_id')
              .eq('id', props.fixtureId)
              .single();

            if (fixture) {
              const calculated = await calculateScoreFromEvents(
                props.fixtureId,
                fixture.home_team_id,
                fixture.away_team_id
              );
              
              setHomeScore(calculated.homeScore);
              setAwayScore(calculated.awayScore);
              
              console.log('✅ useRealTimeScore: Score updated from goal event:', calculated);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      console.log('🔌 useRealTimeScore: Cleaning up real-time subscription');
      supabase.removeChannel(fixtureChannel);
    };
  }, [props?.fixtureId]);

  // Manual refresh function
  const refreshScore = () => {
    if (props?.fixtureId) {
      console.log('🔄 useRealTimeScore: Manual score refresh requested');
      fetchInitialScore(props.fixtureId);
    }
  };

  // Legacy compatibility functions
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
    refreshScore
  };
};
