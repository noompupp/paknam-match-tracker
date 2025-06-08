
import { supabase } from '@/integrations/supabase/client';
import { incrementMemberGoals, incrementMemberAssists } from './memberStatsUpdateService';
import { getValidatedTeamId } from '@/utils/teamIdMapping';

interface GoalAssignmentData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  eventTime: number;
  type: 'goal' | 'assist';
}

export const assignGoalToPlayer = async (data: GoalAssignmentData) => {
  console.log('⚽ SimplifiedGoalAssignmentService: Starting enhanced goal/assist assignment:', data);
  
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

    console.log('✅ SimplifiedGoalAssignmentService: Input validation passed:', {
      playerId: data.playerId,
      playerName: data.playerName,
      teamId: teamIdString,
      eventTime: data.eventTime,
      type: data.type
    });

    // Verify team exists in database before proceeding
    const { data: teamExists, error: teamCheckError } = await supabase
      .from('teams')
      .select('__id__, name')
      .eq('__id__', teamIdString)
      .single();

    if (teamCheckError || !teamExists) {
      console.error('❌ SimplifiedGoalAssignmentService: Team ID not found in database:', {
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

      console.log('🔧 SimplifiedGoalAssignmentService: Using team found by name lookup:', teamByName[0]);
      data.teamId = teamByName[0].__id__;
    } else {
      console.log('✅ SimplifiedGoalAssignmentService: Team verified in database:', teamExists);
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
      console.error('❌ SimplifiedGoalAssignmentService: Duplicate check failed:', duplicateCheckError);
      throw new Error(`Failed to check for duplicates: ${duplicateCheckError.message}`);
    }

    if (existingEvents && existingEvents.length > 0) {
      console.warn('🚫 SimplifiedGoalAssignmentService: Duplicate event prevented');
      throw new Error(`This ${data.type} has already been assigned to ${data.playerName} at this time`);
    }

    // Create match event with enhanced error handling
    const { data: matchEvent, error: eventError } = await supabase
      .from('match_events')
      .insert({
        fixture_id: data.fixtureId,
        event_type: data.type,
        player_name: data.playerName,
        team_id: data.teamId, // Use the validated team ID
        event_time: data.eventTime,
        description: `${data.type === 'goal' ? 'Goal' : 'Assist'} by ${data.playerName} at ${Math.floor(data.eventTime / 60)}'${String(data.eventTime % 60).padStart(2, '0')}`
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ SimplifiedGoalAssignmentService: Error creating match event:', eventError);
      
      // Provide more specific error messages
      if (eventError.code === '23503') {
        throw new Error(`Team ID "${data.teamId}" not found in database. Please verify team data.`);
      } else if (eventError.code === '23505') {
        throw new Error('Duplicate event detected. This goal/assist may already be assigned.');
      } else {
        throw new Error(`Failed to create match event: ${eventError.message}`);
      }
    }

    console.log('✅ SimplifiedGoalAssignmentService: Match event created successfully:', matchEvent);

    // Update member stats with error handling
    try {
      if (data.type === 'goal') {
        await incrementMemberGoals(data.playerId, 1);
        console.log('✅ SimplifiedGoalAssignmentService: Member goals incremented');
      } else if (data.type === 'assist') {
        await incrementMemberAssists(data.playerId, 1);
        console.log('✅ SimplifiedGoalAssignmentService: Member assists incremented');
      }
    } catch (statsError) {
      console.error('❌ SimplifiedGoalAssignmentService: Failed to update member stats:', statsError);
      
      // Rollback the match event if stats update fails
      await supabase
        .from('match_events')
        .delete()
        .eq('id', matchEvent.id);
      
      throw new Error(`Failed to update player statistics: ${statsError instanceof Error ? statsError.message : 'Unknown error'}`);
    }

    console.log('✅ SimplifiedGoalAssignmentService: Goal/assist assignment completed successfully');
    return matchEvent;

  } catch (error) {
    console.error('❌ SimplifiedGoalAssignmentService: Critical error:', error);
    throw error;
  }
};

export const getUnassignedGoals = async (fixtureId: number) => {
  console.log('🔍 SimplifiedGoalAssignmentService: Getting unassigned goals for fixture:', fixtureId);
  
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
      console.error('❌ SimplifiedGoalAssignmentService: Error fetching unassigned goals:', error);
      throw error;
    }

    console.log(`📊 SimplifiedGoalAssignmentService: Found ${events?.length || 0} unassigned/quick goals`);
    return events || [];

  } catch (error) {
    console.error('❌ SimplifiedGoalAssignmentService: Critical error fetching unassigned goals:', error);
    throw error;
  }
};
