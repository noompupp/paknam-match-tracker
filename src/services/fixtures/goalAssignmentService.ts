
import { supabase } from '@/integrations/supabase/client';
import { incrementPlayerGoals, incrementPlayerAssists } from './playerStatsUpdateService';

interface GoalAssignment {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: number;
  eventTime: number;
  type: 'goal' | 'assist';
}

export const assignGoalToPlayer = async (assignment: GoalAssignment): Promise<void> => {
  console.log('⚽ GoalAssignmentService: Starting goal assignment with improved error handling:', assignment);
  
  try {
    const { fixtureId, playerId, playerName, teamId, eventTime, type } = assignment;

    // Validate input parameters
    if (!fixtureId || !playerId || !playerName || !teamId || eventTime < 0) {
      throw new Error('Invalid assignment parameters: All fields are required and event time must be non-negative');
    }

    if (!['goal', 'assist'].includes(type)) {
      throw new Error(`Invalid event type: ${type}. Must be 'goal' or 'assist'`);
    }

    console.log('✅ GoalAssignmentService: Input validation passed');

    // Verify that the fixture exists and get team information for validation
    const { data: fixture, error: fixtureError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id')
      .eq('id', fixtureId)
      .single();

    if (fixtureError || !fixture) {
      console.error('❌ GoalAssignmentService: Fixture validation failed:', fixtureError);
      throw new Error(`Fixture with ID ${fixtureId} not found or invalid`);
    }

    console.log('✅ GoalAssignmentService: Fixture validation passed:', fixture);

    // Verify that the player exists
    const { data: player, error: playerError } = await supabase
      .from('members')
      .select('id, name, team_id')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      console.error('❌ GoalAssignmentService: Player validation failed:', playerError);
      throw new Error(`Player with ID ${playerId} not found`);
    }

    console.log('✅ GoalAssignmentService: Player validation passed:', player);

    // Create or update the match event
    const { data: existingEvents, error: fetchError } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', type)
      .eq('player_name', 'Unknown Player')
      .eq('team_id', teamId)
      .limit(1);

    if (fetchError) {
      console.error('❌ GoalAssignmentService: Error fetching existing events:', fetchError);
      throw new Error(`Failed to fetch existing events: ${fetchError.message}`);
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
        throw new Error(`Failed to update match event: ${updateError.message}`);
      }

      console.log('✅ GoalAssignmentService: Successfully updated existing match event');
    } else {
      // Create new match event
      const { error: insertError } = await supabase
        .from('match_events')
        .insert([{
          fixture_id: fixtureId,
          event_type: type,
          player_name: playerName,
          team_id: teamId,
          event_time: eventTime,
          description: `${type === 'goal' ? 'Goal' : 'Assist'} by ${playerName}`
        }]);

      if (insertError) {
        console.error('❌ GoalAssignmentService: Error creating match event:', insertError);
        throw new Error(`Failed to create match event: ${insertError.message}`);
      }

      console.log('✅ GoalAssignmentService: Successfully created new match event');
    }

    // Update player statistics
    console.log(`📊 GoalAssignmentService: Updating player stats for ${playerName}...`);
    try {
      if (type === 'goal') {
        await incrementPlayerGoals(playerId, 1);
        console.log('✅ GoalAssignmentService: Player goals updated successfully');
      } else if (type === 'assist') {
        await incrementPlayerAssists(playerId, 1);
        console.log('✅ GoalAssignmentService: Player assists updated successfully');
      }
    } catch (statsError) {
      console.error('❌ GoalAssignmentService: Failed to update player stats:', statsError);
      // Don't throw here as the match event was successfully created
      console.warn('⚠️ GoalAssignmentService: Match event created but player stats update failed');
    }

    console.log(`✅ GoalAssignmentService: Successfully completed ${type} assignment to ${playerName}`);

  } catch (error) {
    console.error('❌ GoalAssignmentService: Critical error in assignGoalToPlayer:', error);
    
    // Re-throw with enhanced error message for better user feedback
    if (error instanceof Error) {
      throw new Error(`Goal assignment failed: ${error.message}`);
    } else {
      throw new Error('Goal assignment failed due to an unknown error');
    }
  }
};

export const getUnassignedGoals = async (fixtureId: number): Promise<any[]> => {
  console.log('🔍 GoalAssignmentService: Getting unassigned goals for fixture:', fixtureId);
  
  try {
    if (!fixtureId || fixtureId <= 0) {
      throw new Error('Invalid fixture ID provided');
    }

    const { data: unassignedEvents, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', 'goal')
      .eq('player_name', 'Unknown Player');

    if (error) {
      console.error('❌ GoalAssignmentService: Error fetching unassigned goals:', error);
      throw new Error(`Failed to fetch unassigned goals: ${error.message}`);
    }

    console.log(`📊 GoalAssignmentService: Found ${unassignedEvents?.length || 0} unassigned goals`);
    return unassignedEvents || [];

  } catch (error) {
    console.error('❌ GoalAssignmentService: Error in getUnassignedGoals:', error);
    throw error;
  }
};
