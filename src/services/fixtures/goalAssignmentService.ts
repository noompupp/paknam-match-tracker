
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
  console.log('⚽ GoalAssignmentService: Starting goal assignment with comprehensive validation:', assignment);
  
  try {
    const { fixtureId, playerId, playerName, teamId, eventTime, type } = assignment;

    // Enhanced validation with detailed error messages
    if (!fixtureId || fixtureId <= 0) {
      throw new Error('Invalid fixture ID: Must be a positive number');
    }
    if (!playerId || playerId <= 0) {
      throw new Error('Invalid player ID: Must be a positive number');
    }
    if (!playerName?.trim()) {
      throw new Error('Player name is required and cannot be empty');
    }
    if (!teamId || teamId <= 0) {
      throw new Error('Invalid team ID: Must be a positive number');
    }
    if (eventTime < 0) {
      throw new Error('Event time must be non-negative');
    }
    if (!['goal', 'assist'].includes(type)) {
      throw new Error(`Invalid event type: ${type}. Must be 'goal' or 'assist'`);
    }

    console.log('✅ GoalAssignmentService: Input validation passed');

    // Verify fixture exists and is valid
    const { data: fixture, error: fixtureError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id')
      .eq('id', fixtureId)
      .single();

    if (fixtureError || !fixture) {
      console.error('❌ GoalAssignmentService: Fixture validation failed:', fixtureError);
      throw new Error(`Fixture with ID ${fixtureId} not found or invalid: ${fixtureError?.message}`);
    }

    console.log('✅ GoalAssignmentService: Fixture validation passed:', fixture);

    // Verify player exists and get current stats - Fixed query without join
    const { data: player, error: playerError } = await supabase
      .from('members')
      .select('id, name, team_id, goals, assists')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      console.error('❌ GoalAssignmentService: Player validation failed:', playerError);
      throw new Error(`Player with ID ${playerId} not found: ${playerError?.message}`);
    }

    console.log('✅ GoalAssignmentService: Player validation passed:', {
      player: player.name,
      currentGoals: player.goals,
      currentAssists: player.assists,
      teamId: player.team_id
    });

    // Enhanced duplicate check with comprehensive criteria
    const { data: existingEvents, error: duplicateCheckError } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', type)
      .eq('player_name', playerName)
      .eq('team_id', teamId)
      .gte('event_time', Math.max(0, eventTime - 30)) // Within 30 seconds
      .lte('event_time', eventTime + 30);

    if (duplicateCheckError) {
      console.error('❌ GoalAssignmentService: Duplicate check failed:', duplicateCheckError);
      throw new Error(`Failed to check for duplicates: ${duplicateCheckError.message}`);
    }

    if (existingEvents && existingEvents.length > 0) {
      console.warn('🚫 GoalAssignmentService: Duplicate event detected:', existingEvents[0]);
      throw new Error(`This ${type} has already been assigned to ${playerName} at this time (±30 seconds)`);
    }

    console.log('✅ GoalAssignmentService: No duplicates found, proceeding with assignment');

    // Create the match event with comprehensive data
    const { data: newEvent, error: insertError } = await supabase
      .from('match_events')
      .insert([{
        fixture_id: fixtureId,
        event_type: type,
        player_name: playerName,
        team_id: teamId,
        event_time: eventTime,
        description: `${type === 'goal' ? 'Goal' : 'Assist'} by ${playerName} at ${Math.floor(eventTime / 60)}'${String(eventTime % 60).padStart(2, '0')}`
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ GoalAssignmentService: Error creating match event:', insertError);
      throw new Error(`Failed to create match event: ${insertError.message}`);
    }

    console.log('✅ GoalAssignmentService: Match event created successfully:', newEvent);

    // Update player statistics with proper error handling
    console.log(`📊 GoalAssignmentService: Updating player stats for ${playerName}...`);
    try {
      if (type === 'goal') {
        await incrementPlayerGoals(playerId, 1);
        console.log('✅ GoalAssignmentService: Player goals incremented successfully');
      } else if (type === 'assist') {
        await incrementPlayerAssists(playerId, 1);
        console.log('✅ GoalAssignmentService: Player assists incremented successfully');
      }
    } catch (statsError) {
      console.error('❌ GoalAssignmentService: Failed to update player stats:', statsError);
      
      // Rollback the match event if stats update fails
      await supabase
        .from('match_events')
        .delete()
        .eq('id', newEvent.id);
      
      throw new Error(`Failed to update player stats: ${statsError instanceof Error ? statsError.message : 'Unknown error'}`);
    }

    console.log(`✅ GoalAssignmentService: Successfully completed ${type} assignment to ${playerName}`);

  } catch (error) {
    console.error('❌ GoalAssignmentService: Critical error in assignGoalToPlayer:', error);
    
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
      .eq('player_name', 'Unknown Player')
      .order('event_time', { ascending: true });

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
