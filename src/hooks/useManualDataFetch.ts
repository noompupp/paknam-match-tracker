
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ManualDataFetchProps {
  fixtureId?: number;
}

export const useManualDataFetch = ({ fixtureId }: ManualDataFetchProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scores from events (no real-time)
  const calculateScoreFromEvents = useCallback(async (targetFixtureId: number) => {
    try {
      console.log('📊 useManualDataFetch: Calculating scores from events for fixture:', targetFixtureId);
      
      const { data: fixture, error: fixtureError } = await supabase
        .from('fixtures')
        .select('home_team_id, away_team_id')
        .eq('id', targetFixtureId)
        .single();

      if (fixtureError || !fixture) {
        console.error('❌ useManualDataFetch: Error fetching fixture:', fixtureError);
        return { homeScore: 0, awayScore: 0 };
      }

      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('team_id, event_type')
        .eq('fixture_id', targetFixtureId)
        .eq('event_type', 'goal');

      if (eventsError) {
        console.error('❌ useManualDataFetch: Error fetching events:', eventsError);
        return { homeScore: 0, awayScore: 0 };
      }

      const homeGoals = events?.filter(event => event.team_id === fixture.home_team_id).length || 0;
      const awayGoals = events?.filter(event => event.team_id === fixture.away_team_id).length || 0;

      console.log('📊 useManualDataFetch: Calculated scores:', { homeGoals, awayGoals });
      return { homeScore: homeGoals, awayScore: awayGoals };

    } catch (error) {
      console.error('❌ useManualDataFetch: Error in calculateScoreFromEvents:', error);
      return { homeScore: 0, awayScore: 0 };
    }
  }, []);

  // Fetch match events manually
  const fetchMatchEvents = useCallback(async (targetFixtureId: number) => {
    try {
      const { data: events, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', targetFixtureId)
        .order('event_time', { ascending: true });

      if (error) {
        console.error('❌ useManualDataFetch: Error fetching match events:', error);
        return [];
      }

      return events || [];
    } catch (error) {
      console.error('❌ useManualDataFetch: Error in fetchMatchEvents:', error);
      return [];
    }
  }, []);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    if (!fixtureId) {
      toast({
        title: "No Fixture Selected",
        description: "Please select a fixture to refresh data",
        variant: "destructive"
      });
      return;
    }

    setIsRefreshing(true);
    try {
      console.log('🔄 useManualDataFetch: Manual refresh initiated for fixture:', fixtureId);

      // Invalidate relevant queries to force refetch
      await queryClient.invalidateQueries({ 
        queryKey: ['matchEvents', fixtureId] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['fixtureScore', fixtureId] 
      });

      // Fetch fresh data
      const [scoreData, eventsData] = await Promise.all([
        calculateScoreFromEvents(fixtureId),
        fetchMatchEvents(fixtureId)
      ]);

      console.log('✅ useManualDataFetch: Refresh completed', { scoreData, eventsCount: eventsData.length });

      toast({
        title: "Data Refreshed",
        description: "Match data has been updated with latest information",
      });

      return { scoreData, eventsData };

    } catch (error) {
      console.error('❌ useManualDataFetch: Error during manual refresh:', error);
      toast({
        title: "Refresh Failed", 
        description: "Unable to refresh match data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [fixtureId, calculateScoreFromEvents, fetchMatchEvents, queryClient, toast]);

  return {
    manualRefresh,
    isRefreshing,
    calculateScoreFromEvents,
    fetchMatchEvents
  };
};
