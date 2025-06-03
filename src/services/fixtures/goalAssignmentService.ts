
import { supabase } from '@/integrations/supabase/client';
import { incrementPlayerGoals, incrementPlayerAssists } from './playerStatsUpdateService';

interface GoalAssignment {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: number; // Now expecting numeric team ID
  eventTime: number;
  type: 'goal' | 'assist';
}

export const assignGoalToPlayer = async (assignment: GoalAssignment): Promise<void> => {
  console.log('⚽ GoalAssignmentService: Assigning goal to player:', assignment);
  
  try {
    const { fixtureId, playerId, playerName, teamId, eventTime, type } = assignment;

    // Create or update the match event with specific player information
    const { data: existingEvents, error: fetchError } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', type)
      .eq('player_name', 'Unknown Player')
      .eq('team_id', teamId) // Using numeric team ID
      .limit(1);

    if (fetchError) {
      console.error('❌ GoalAssignmentService: Error fetching existing events:', fetchError);
      throw fetchError;
    }

    if (existingEvents && existingEvents.length > 0) {
      // Update existing "Unknown Player" event
      const eventToUpdate = existingEvents[0];
      
      const { error: updateError } = await supabase
        .from('match_events')
        .update({
          player_name: playerName,
          event_time: eventTime,
          description: `${type === 'goal' ? 'Goal' : 'Assist'} by ${playerName}`
        })
        .eq('id', eventToUpdate.id);

      if (updateError) {
        console.error('❌ GoalAssignmentService: Error updating match event:', updateError);
        throw updateError;
      }

      console.log('✅ GoalAssignmentService: Updated existing match event for player assignment');
    } else {
      // Create new match event
      const { error: insertError } = await supabase
        .from('match_events')
        .insert([{
          fixture_id: fixtureId,
          event_type: type,
          player_name: playerName,
          team_id: teamId, // Using numeric team ID
          event_time: eventTime,
          description: `${type === 'goal' ? 'Goal' : 'Assist'} by ${playerName}`
        }]);

      if (insertError) {
        console.error('❌ GoalAssignmentService: Error creating match event:', insertError);
        throw insertError;
      }

      console.log('✅ GoalAssignmentService: Created new match event for player assignment');
    }

    // Update player statistics immediately
    console.log(`📊 GoalAssignmentService: Updating player stats for ${playerName}...`);
    if (type === 'goal') {
      await incrementPlayerGoals(playerId, 1);
    } else if (type === 'assist') {
      await incrementPlayerAssists(playerId, 1);
    }

    console.log(`✅ GoalAssignmentService: Successfully assigned ${type} to ${playerName} and updated stats`);

  } catch (error) {
    console.error('❌ GoalAssignmentService: Critical error assigning goal to player:', error);
    throw error;
  }
};

export const getUnassignedGoals = async (fixtureId: number): Promise<any[]> => {
  console.log('🔍 GoalAssignmentService: Getting unassigned goals for fixture:', fixtureId);
  
  try {
    const { data: unassignedEvents, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', 'goal')
      .eq('player_name', 'Unknown Player');

    if (error) {
      console.error('❌ GoalAssignmentService: Error fetching unassigned goals:', error);
      throw error;
    }

    console.log(`📊 GoalAssignmentService: Found ${unassignedEvents?.length || 0} unassigned goals`);
    return unassignedEvents || [];

  } catch (error) {
    console.error('❌ GoalAssignmentService: Error getting unassigned goals:', error);
    throw error;
  }
};
