
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MatchStateSyncProps {
  fixtureId?: number;
  onScoreUpdate?: (homeScore: number, awayScore: number) => void;
  onMatchEventUpdate?: (event: any) => void;
  onFixtureStatusUpdate?: (status: string) => void;
}

export const useMatchStateSync = (props: MatchStateSyncProps) => {
  const { toast } = useToast();

  // Calculate and sync scores from events
  const syncScoreFromEvents = useCallback(async (fixtureId: number) => {
    try {
      console.log('🔄 useMatchStateSync: Syncing scores from events for fixture:', fixtureId);
      
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('home_team_id, away_team_id')
        .eq('id', fixtureId)
        .single();

      if (fixtureError || !fixture) {
        console.error('❌ useMatchStateSync: Error fetching fixture:', fixtureError);
        return;
      }

      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('team_id, event_type')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal');

      if (eventsError) {
        console.error('❌ useMatchStateSync: Error fetching events:', eventsError);
        return;
      }

      const homeGoals = events?.filter(event => event.team_id === fixture.home_team_id).length || 0;
      const awayGoals = events?.filter(event => event.team_id === fixture.away_team_id).length || 0;

      console.log('📊 useMatchStateSync: Calculated scores:', { homeGoals, awayGoals });

      // Update fixture with calculated scores
      const { error: updateError } = await supabase
        .from('fixtures')
        .update({
          home_score: homeGoals,
          away_score: awayGoals
        })
        .eq('id', fixtureId);

      if (updateError) {
        console.error('❌ useMatchStateSync: Error updating fixture scores:', updateError);
      } else {
        console.log('✅ useMatchStateSync: Fixture scores synchronized');
        
        // Notify score update
        if (props.onScoreUpdate) {
          props.onScoreUpdate(homeGoals, awayGoals);
        }
      }

    } catch (error) {
      console.error('❌ useMatchStateSync: Error in syncScoreFromEvents:', error);
    }
  }, [props.onScoreUpdate]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!props.fixtureId) {
      console.log('⚠️ useMatchStateSync: No fixture ID provided, skipping subscription');
      return;
    }

    console.log('🔗 useMatchStateSync: Setting up real-time subscriptions for fixture:', props.fixtureId);

    // Subscribe to fixture changes
    const fixtureChannel = supabase
      .channel(`fixture-sync-${props.fixtureId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fixtures',
          filter: `id=eq.${props.fixtureId}`
        },
        (payload) => {
          console.log('🔄 useMatchStateSync: Fixture updated:', payload);
          const newData = payload.new as any;
          
          if (props.onScoreUpdate && newData.home_score !== null && newData.away_score !== null) {
            props.onScoreUpdate(newData.home_score, newData.away_score);
          }
          
          if (props.onFixtureStatusUpdate && newData.status) {
            props.onFixtureStatusUpdate(newData.status);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_events',
          filter: `fixture_id=eq.${props.fixtureId}`
        },
        async (payload) => {
          console.log('🎯 useMatchStateSync: Match event changed:', payload);
          
          if (props.onMatchEventUpdate) {
            props.onMatchEventUpdate(payload);
          }

          // If it's a goal event, sync scores automatically
          const event = payload.new as any;
          if (event?.event_type === 'goal') {
            console.log('⚽ useMatchStateSync: Goal event detected, syncing scores');
            await syncScoreFromEvents(props.fixtureId!);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      console.log('🔌 useMatchStateSync: Cleaning up subscriptions');
      supabase.removeChannel(fixtureChannel);
    };
  }, [props.fixtureId, props.onScoreUpdate, props.onMatchEventUpdate, props.onFixtureStatusUpdate, syncScoreFromEvents]);

  return {
    syncScoreFromEvents: () => props.fixtureId ? syncScoreFromEvents(props.fixtureId) : Promise.resolve(),
    forceRefresh: async () => {
      if (props.fixtureId) {
        console.log('🔄 useMatchStateSync: Force refreshing match state');
        await syncScoreFromEvents(props.fixtureId);
        
        toast({
          title: "Match State Refreshed",
          description: "All match data has been synchronized",
        });
      }
    }
  };
};
