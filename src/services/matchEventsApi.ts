
import { supabase } from '@/integrations/supabase/client';
import { MatchEvent } from '@/types/database';

// Match Events API - now using real Supabase database
export const matchEventsApi = {
  getByFixture: async (fixtureId: number): Promise<MatchEvent[]> => {
    console.log('🎯 matchEventsApi.getByFixture: Starting query for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('event_time', { ascending: true });

      if (error) {
        console.error('🎯 matchEventsApi.getByFixture: Database error:', error);
        throw error;
      }

      console.log('🎯 matchEventsApi.getByFixture: Query successful, events:', data);
      return data || [];
    } catch (error) {
      console.error('🎯 matchEventsApi.getByFixture: Failed to fetch match events:', error);
      throw error;
    }
  },

  create: async (event: Omit<MatchEvent, 'id' | 'created_at'>): Promise<MatchEvent> => {
    console.log('🎯 matchEventsApi.create: Creating event:', event);
    
    try {
      const { data, error } = await supabase
        .from('match_events')
        .insert([event])
        .select()
        .single();

      if (error) {
        console.error('🎯 matchEventsApi.create: Database error:', error);
        throw error;
      }

      console.log('🎯 matchEventsApi.create: Event created successfully:', data);
      return data;
    } catch (error) {
      console.error('🎯 matchEventsApi.create: Failed to create match event:', error);
      throw error;
    }
  },

  updatePlayerStats: async (playerId: number, goals?: number, assists?: number) => {
    console.log('🎯 matchEventsApi.updatePlayerStats: Updating stats for player:', { playerId, goals, assists });
    
    try {
      const updates: any = {};
      
      if (goals !== undefined) {
        updates.goals = goals;
      }
      
      if (assists !== undefined) {
        updates.assists = assists;
      }

      if (Object.keys(updates).length === 0) {
        console.log('🎯 matchEventsApi.updatePlayerStats: No updates to apply');
        return { success: true, playerId, goals, assists };
      }

      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', playerId)
        .select()
        .single();

      if (error) {
        console.error('🎯 matchEventsApi.updatePlayerStats: Database error:', error);
        throw error;
      }

      console.log('🎯 matchEventsApi.updatePlayerStats: Stats updated successfully:', data);
      return {
        success: true,
        playerId,
        goals,
        assists,
        updatedPlayer: data
      };
    } catch (error) {
      console.error('🎯 matchEventsApi.updatePlayerStats: Failed to update player stats:', error);
      throw error;
    }
  }
};
