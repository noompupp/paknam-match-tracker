
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseUnassignedGoalsProps {
  fixtureId?: number;
  refreshTrigger?: number;
}

export const useUnassignedGoals = ({ fixtureId, refreshTrigger }: UseUnassignedGoalsProps = {}) => {
  const [unassignedGoalsCount, setUnassignedGoalsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUnassignedGoals = async () => {
    if (!fixtureId) {
      console.log('⚠️ useUnassignedGoals: No fixture ID provided, setting count to 0');
      setUnassignedGoalsCount(0);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 useUnassignedGoals: Fetching unassigned goals for fixture:', fixtureId);
      
      const { data: unassignedEvents, error } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .in('player_name', ['Unknown Player', 'Quick Goal']);

      if (error) {
        console.error('❌ useUnassignedGoals: Error fetching unassigned goals:', error);
        toast({
          title: "Error Loading Goals",
          description: "Failed to check for unassigned goals",
          variant: "destructive"
        });
        return;
      }

      const count = unassignedEvents?.length || 0;
      console.log('📊 useUnassignedGoals: Found unassigned goals count:', count);
      setUnassignedGoalsCount(count);

    } catch (error) {
      console.error('❌ useUnassignedGoals: Unexpected error:', error);
      toast({
        title: "Error Loading Goals",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when fixture changes
  useEffect(() => {
    fetchUnassignedGoals();
  }, [fixtureId]);

  // Fetch when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchUnassignedGoals();
    }
  }, [refreshTrigger]);

  // Set up real-time subscription for match events
  useEffect(() => {
    if (!fixtureId) return;

    console.log('🔗 useUnassignedGoals: Setting up real-time subscription for fixture:', fixtureId);

    const channel = supabase
      .channel(`unassigned-goals-${fixtureId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_events',
          filter: `fixture_id=eq.${fixtureId}`
        },
        (payload) => {
          console.log('🎯 useUnassignedGoals: Match event changed:', payload);
          
          // Check if this affects unassigned goals
          const event = payload.new as any;
          if (event?.event_type === 'goal' && 
              ['Unknown Player', 'Quick Goal'].includes(event?.player_name)) {
            console.log('⚡ useUnassignedGoals: Unassigned goal event detected, refreshing count');
            setTimeout(() => fetchUnassignedGoals(), 500);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 useUnassignedGoals: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [fixtureId]);

  return {
    unassignedGoalsCount,
    isLoading,
    refreshUnassignedGoals: fetchUnassignedGoals
  };
};
