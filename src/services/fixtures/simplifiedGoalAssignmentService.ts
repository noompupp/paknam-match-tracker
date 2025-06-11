
import { supabase } from '@/integrations/supabase/client';
import { incrementMemberGoals, incrementMemberAssists } from './memberStatsUpdateService';

interface GoalAssignment {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  eventTime: number;
  type: 'goal' | 'assist';
  isOwnGoal?: boolean;
}

export const assignGoalToPlayer = async (data: GoalAssignment) => {
  console.log('⚽ SimplifiedGoalAssignmentService: Starting goal/assist assignment with own goal support:', data);
  
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

    const teamIdString = String(data.teamId).trim();
    const isOwnGoal = data.isOwnGoal || false;

    // For own goals, don't allow assists
    if (isOwnGoal && data.type === 'assist') {
      throw new Error('Own goals cannot have assists');
    }

    console.log('✅ SimplifiedGoalAssignmentService: Input validation passed:', {
      playerId: data.playerId,
      playerName: data.playerName,
      teamId: teamIdString,
      eventTime: data.eventTime,
      type: data.type,
      isOwnGoal
    });

    // Enhanced duplicate check with own goal consideration
    const { data: existingEvents, error: duplicateCheckError } = await supabase
      .from('match_events')
      .select('id')
      .eq('fixture_id', data.fixtureId)
      .eq('event_type', data.type)
      .eq('player_name', data.playerName)
      .eq('team_id', teamIdString)
      .eq('own_goal', isOwnGoal)
      .gte('event_time', Math.max(0, data.eventTime - 10))
      .lte('event_time', data.eventTime + 10);

    if (duplicateCheckError) {
      console.error('❌ SimplifiedGoalAssignmentService: Duplicate check failed:', duplicateCheckError);
      throw new Error(`Failed to check for duplicates: ${duplicateCheckError.message}`);
    }

    if (existingEvents && existingEvents.length > 0) {
      console.warn('🚫 SimplifiedGoalAssignmentService: Duplicate event prevented');
      throw new Error(`This ${isOwnGoal ? 'own goal' : data.type} has already been assigned to ${data.playerName} at this time`);
    }

    // Create match event with enhanced own goal support
    const { data: matchEvent, error: eventError } = await supabase
      .from('match_events')
      .insert({
        fixture_id: data.fixtureId,
        event_type: data.type,
        player_name: data.playerName,
        team_id: teamIdString,
        event_time: data.eventTime,
        own_goal: data.type === 'goal' ? isOwnGoal : null,
        description: `${isOwnGoal ? 'Own Goal' : (data.type === 'goal' ? 'Goal' : 'Assist')} by ${data.playerName} at ${Math.floor(data.eventTime / 60)}'${String(data.eventTime % 60).padStart(2, '0')}`
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ SimplifiedGoalAssignmentService: Error creating match event:', eventError);
      throw new Error(`Failed to create match event: ${eventError.message}`);
    }

    console.log('✅ SimplifiedGoalAssignmentService: Match event created successfully:', matchEvent);

    // Update member stats with own goal consideration
    try {
      if (data.type === 'goal' && !isOwnGoal) {
        // Only increment stats for regular goals, not own goals
        await incrementMemberGoals(data.playerId, 1);
        console.log('✅ SimplifiedGoalAssignmentService: Member goals incremented (regular goal)');
      } else if (data.type === 'goal' && isOwnGoal) {
        console.log('ℹ️ SimplifiedGoalAssignmentService: Own goal recorded, member stats not incremented');
      } else if (data.type === 'assist') {
        await incrementMemberAssists(data.playerId, 1);
        console.log('✅ SimplifiedGoalAssignmentService: Member assists incremented');
      }
    } catch (statsError) {
      console.error('❌ SimplifiedGoalAssignmentService: Failed to update member stats:', statsError);
      
      // Rollback the match event if stats update fails (except for own goals)
      if (!isOwnGoal) {
        await supabase
          .from('match_events')
          .delete()
          .eq('id', matchEvent.id);
        
        throw new Error(`Failed to update player statistics: ${statsError instanceof Error ? statsError.message : 'Unknown error'}`);
      }
    }

    console.log('✅ SimplifiedGoalAssignmentService: Goal/assist assignment completed successfully with own goal support');
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
