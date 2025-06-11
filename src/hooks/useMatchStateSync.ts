
import { useCallback } from "react";
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

  // Manual score calculation and sync (no real-time subscriptions)
  const syncScoreFromEvents = useCallback(async (fixtureId: number) => {
    try {
      console.log('🔄 useMatchStateSync: Manual score sync for fixture:', fixtureId);
      
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

      console.log('📊 useMatchStateSync: Calculated scores manually:', { homeGoals, awayGoals });

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
        console.log('✅ useMatchStateSync: Fixture scores synchronized manually');
        
        // Notify score update
        if (props.onScoreUpdate) {
          props.onScoreUpdate(homeGoals, awayGoals);
        }
      }

    } catch (error) {
      console.error('❌ useMatchStateSync: Error in manual sync:', error);
    }
  }, [props.onScoreUpdate]);

  // Manual refresh function with user feedback
  const forceRefresh = useCallback(async () => {
    if (props.fixtureId) {
      console.log('🔄 useMatchStateSync: Manual force refresh initiated');
      await syncScoreFromEvents(props.fixtureId);
      
      toast({
        title: "Match Data Refreshed",
        description: "All match data has been synchronized manually",
      });
    }
  }, [props.fixtureId, syncScoreFromEvents, toast]);

  return {
    syncScoreFromEvents: () => props.fixtureId ? syncScoreFromEvents(props.fixtureId) : Promise.resolve(),
    forceRefresh
  };
};
