
import { supabase } from '@/integrations/supabase/client';
import { incrementMemberGoals, incrementMemberAssists } from './memberStatsUpdateService';

interface GoalAssignment {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  eventTime: number;
  type: 'goal' | 'assist';
  isOwnGoal?: boolean; // Add own goal flag
}

export const assignGoalToPlayer = async (data: GoalAssignment) => {
  console.log('⚽ GoalAssignmentService: Starting enhanced goal/assist assignment with own goal support:', data);
  
  try {
    // Enhanced input validation
    if (!data.playerId || !data.playerName?.trim() || !data.teamId?.trim() || !data.fixtureId) {
      throw new Error('Missing required data for goal assignment');
    }

    if (data.eventTime < 0) {
      throw new Error('Invalid event time provided');
    }

    if (!['goal', 'assist'].includes(data.type)) {
      throw new Error('Invalid event type provided');
    }

    // Ensure teamId is a string and handle any formatting issues
    const teamIdString = String(data.teamId).trim();
    const isOwnGoal = data.isOwnGoal || false;

    console.log('✅ GoalAssignmentService: Input validation passed:', {
      playerId: data.playerId,
      playerName: data.playerName,
      teamId: teamIdString,
      eventTime: data.eventTime,
      type: data.type,
      isOwnGoal
    });

    // Verify team exists in database before proceeding
    const { data: teamExists, error: teamCheckError } = await supabase
      .from('teams')
      .select('__id__, name')
      .eq('__id__', teamIdString)
      .single();

    if (teamCheckError || !teamExists) {
      console.error('❌ GoalAssignmentService: Team ID not found in database:', {
        teamId: teamIdString,
        error: teamCheckError
      });
      
      // Try to find team by name if __id__ lookup fails
      const { data: teamByName, error: teamNameError } = await supabase
        .from('teams')
        .select('__id__, name')
        .ilike('name', `%${data.playerName.split(' ')[0]}%`) // Basic team name guess
        .limit(1);

      if (teamNameError || !teamByName || teamByName.length === 0) {
        throw new Error(`Team with ID "${teamIdString}" not found in database. Please verify team data.`);
      }

      console.log('🔧 GoalAssignmentService: Using team found by name lookup:', teamByName[0]);
      data.teamId = teamByName[0].__id__;
    } else {
      console.log('✅ GoalAssignmentService: Team verified in database:', teamExists);
    }

    // Enhanced duplicate check
    const { data: existingEvents, error: duplicateCheckError } = await supabase
      .from('match_events')
      .select('id')
      .eq('fixture_id', data.fixtureId)
      .eq('event_type', data.type)
      .eq('player_name', data.playerName)
      .eq('team_id', teamIdString)
      .gte('event_time', Math.max(0, data.eventTime - 10)) // Within 10 seconds
      .lte('event_time', data.eventTime + 10);

    if (duplicateCheckError) {
      console.error('❌ GoalAssignmentService: Duplicate check failed:', duplicateCheckError);
      throw new Error(`Failed to check for duplicates: ${duplicateCheckError.message}`);
    }

    if (existingEvents && existingEvents.length > 0) {
      console.warn('🚫 GoalAssignmentService: Duplicate event prevented');
      throw new Error(`This ${data.type} has already been assigned to ${data.playerName} at this time`);
    }

    // Create match event with enhanced error handling and own goal support
    const { data: matchEvent, error: eventError } = await supabase
      .from('match_events')
      .insert({
        fixture_id: data.fixtureId,
        event_type: data.type,
        player_name: data.playerName,
        team_id: data.teamId, // Use the validated team ID
        event_time: data.eventTime,
        own_goal: data.type === 'goal' ? isOwnGoal : null, // Only set own_goal for goals
        description: `${isOwnGoal ? 'Own Goal' : (data.type === 'goal' ? 'Goal' : 'Assist')} by ${data.playerName} at ${Math.floor(data.eventTime / 60)}'${String(data.eventTime % 60).padStart(2, '0')}`
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ GoalAssignmentService: Error creating match event:', eventError);
      
      // Provide more specific error messages
      if (eventError.code === '23503') {
        throw new Error(`Team ID "${data.teamId}" not found in database. Please verify team data.`);
      } else if (eventError.code === '23505') {
        throw new Error('Duplicate event detected. This goal/assist may already be assigned.');
      } else {
        throw new Error(`Failed to create match event: ${eventError.message}`);
      }
    }

    console.log('✅ GoalAssignmentService: Match event created successfully:', matchEvent);

    // Update member stats with error handling (only for regular goals, not own goals)
    try {
      if (data.type === 'goal' && !isOwnGoal) {
        await incrementMemberGoals(data.playerId, 1);
        console.log('✅ GoalAssignmentService: Member goals incremented (regular goal)');
      } else if (data.type === 'goal' && isOwnGoal) {
        console.log('ℹ️ GoalAssignmentService: Own goal recorded, member stats not incremented');
      } else if (data.type === 'assist') {
        await incrementMemberAssists(data.playerId, 1);
        console.log('✅ GoalAssignmentService: Member assists incremented');
      }
    } catch (statsError) {
      console.error('❌ GoalAssignmentService: Failed to update member stats:', statsError);
      
      // Rollback the match event if stats update fails
      await supabase
        .from('match_events')
        .delete()
        .eq('id', matchEvent.id);
      
      throw new Error(`Failed to update player statistics: ${statsError instanceof Error ? statsError.message : 'Unknown error'}`);
    }

    console.log('✅ GoalAssignmentService: Goal/assist assignment completed successfully with own goal support');
    return matchEvent;

  } catch (error) {
    console.error('❌ GoalAssignmentService: Critical error:', error);
    throw error;
  }
};

export const getUnassignedGoals = async (fixtureId: number) => {
  console.log('🔍 GoalAssignmentService: Getting unassigned goals for fixture:', fixtureId);
  
  try {
    if (!fixtureId || fixtureId <= 0) {
      throw new Error('Invalid fixture ID provided');
    }

    const { data: events, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', 'goal')
      .in('player_name', ['Unknown Player', 'Quick Goal'])
      .order('event_time', { ascending: true });

    if (error) {
      console.error('❌ GoalAssignmentService: Error fetching unassigned goals:', error);
      throw error;
    }

    console.log(`📊 GoalAssignmentService: Found ${events?.length || 0} unassigned/quick goals`);
    return events || [];

  } catch (error) {
    console.error('❌ GoalAssignmentService: Critical error fetching unassigned goals:', error);
    throw error;
  }
};
