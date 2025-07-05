
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
      // Type assertion is safe here because database CHECK constraint ensures valid event_type values
      return (data || []) as MatchEvent[];
    } catch (error) {
      console.error('🎯 matchEventsApi.getByFixture: Failed to fetch match events:', error);
      throw error;
    }
  },

  create: async (event: Omit<MatchEvent, 'id' | 'created_at'>): Promise<MatchEvent> => {
    console.log('🎯 matchEventsApi.create: Creating event with team ID mapping (ENHANCED DEBUG):', {
      event,
      playerName: event.player_name,
      eventType: event.event_type,
      teamId: event.team_id,
      teamIdType: typeof event.team_id,
      scoringTeamId: event.scoring_team_id,
      affectedTeamId: event.affected_team_id,
      fixtureId: event.fixture_id,
      eventTime: event.event_time
    });
    
    // Enhanced validation before database insert
    if (!event.team_id) {
      console.error('❌ matchEventsApi.create: Missing team_id');
      throw new Error('team_id is required for match events');
    }
    
    // Check for potential duplicate protection issues
    console.log('🔍 matchEventsApi.create: Checking for existing similar events...');
    
    try {
      // Query for similar events to understand duplicate patterns
      const { data: existingEvents, error: queryError } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', event.fixture_id)
        .eq('player_name', event.player_name)
        .eq('event_type', event.event_type);
      
      if (queryError) {
        console.warn('⚠️ matchEventsApi.create: Could not check existing events:', queryError);
      } else {
        console.log('🔍 matchEventsApi.create: Found existing similar events:', {
          count: existingEvents?.length || 0,
          events: existingEvents?.map(e => ({
            id: e.id,
            time: e.event_time,
            player: e.player_name,
            type: e.event_type,
            teamId: e.team_id
          }))
        });
      }
    } catch (queryError) {
      console.warn('⚠️ matchEventsApi.create: Exception during duplicate check:', queryError);
    }
    
    try {
      const { data, error } = await supabase
        .from('match_events')
        .insert([event])
        .select()
        .single();

      if (error) {
        console.error('❌ matchEventsApi.create: Database error (TEAM ID MAPPING DEBUG):', {
          error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          eventData: event,
          teamIdAnalysis: {
            teamId: event.team_id,
            teamIdType: typeof event.team_id,
            scoringTeamId: event.scoring_team_id,
            affectedTeamId: event.affected_team_id,
            isNumeric: !isNaN(Number(event.team_id)),
            possibleIssue: 'Team ID format mismatch - check if numeric fixture team IDs are being converted to text-based team __id__ values'
          }
        });
        throw error;
      }

      console.log('✅ matchEventsApi.create: Event created successfully with proper team ID mapping:', {
        eventId: data.id,
        teamId: data.team_id,
        scoringTeamId: data.scoring_team_id,
        playerName: data.player_name,
        eventType: data.event_type
      });
      
      // Type assertion is safe here because database CHECK constraint ensures valid event_type values
      return data as MatchEvent;
    } catch (error) {
      console.error('❌ matchEventsApi.create: Failed to create match event with team ID details:', {
        error,
        teamIdMappingInfo: {
          originalTeamId: event.team_id,
          teamIdType: typeof event.team_id,
          suggestion: 'Ensure numeric fixture team IDs are converted to text-based team.__id__ values before database insert'
        }
      });
      throw error;
    }
  },

  update: async (eventId: number, updates: Partial<Omit<MatchEvent, 'id' | 'created_at'>>): Promise<MatchEvent> => {
    console.log('🎯 matchEventsApi.update: Updating event:', { eventId, updates });
    
    try {
      const { data, error } = await supabase
        .from('match_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        console.error('🎯 matchEventsApi.update: Database error:', error);
        throw error;
      }

      console.log('🎯 matchEventsApi.update: Event updated successfully:', data);
      return data as MatchEvent;
    } catch (error) {
      console.error('🎯 matchEventsApi.update: Failed to update match event:', error);
      throw error;
    }
  },

  delete: async (eventId: number): Promise<void> => {
    console.log('🎯 matchEventsApi.delete: Deleting event:', eventId);
    
    try {
      const { error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('🎯 matchEventsApi.delete: Database error:', error);
        throw error;
      }

      console.log('🎯 matchEventsApi.delete: Event deleted successfully');
    } catch (error) {
      console.error('🎯 matchEventsApi.delete: Failed to delete match event:', error);
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
