
import { supabase } from '@/integrations/supabase/client';
import { incrementMemberGoals, incrementMemberAssists } from './memberStatsUpdateService';

interface GoalAssignmentData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  eventTime: number;
  type: 'goal' | 'assist';
}

export const assignGoalToPlayer = async (data: GoalAssignmentData) => {
  console.log('⚽ SimplifiedGoalAssignmentService: Starting goal/assist assignment:', data);
  
  try {
    // Validate input
    if (!data.playerId || !data.playerName || !data.teamId || !data.fixtureId) {
      throw new Error('Missing required data for goal assignment');
    }

    // Ensure teamId is a string and handle numeric values
    const teamIdString = String(data.teamId);

    // Create match event
    const { data: matchEvent, error: eventError } = await supabase
      .from('match_events')
      .insert({
        fixture_id: data.fixtureId,
        event_type: data.type,
        player_name: data.playerName,
        team_id: teamIdString,
        event_time: data.eventTime,
        description: `${data.type === 'goal' ? 'Goal' : 'Assist'} by ${data.playerName}`
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ SimplifiedGoalAssignmentService: Error creating match event:', eventError);
      throw new Error(`Failed to create match event: ${eventError.message}`);
    }

    // Update member stats directly
    if (data.type === 'goal') {
      await incrementMemberGoals(data.playerId, 1);
    } else if (data.type === 'assist') {
      await incrementMemberAssists(data.playerId, 1);
    }

    console.log('✅ SimplifiedGoalAssignmentService: Goal/assist assigned successfully');
    return matchEvent;

  } catch (error) {
    console.error('❌ SimplifiedGoalAssignmentService: Critical error:', error);
    throw error;
  }
};

export const getUnassignedGoals = async (fixtureId: number) => {
  console.log('🔍 SimplifiedGoalAssignmentService: Getting unassigned goals for fixture:', fixtureId);
  
  try {
    const { data: events, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', 'goal')
      .eq('player_name', 'Unknown Player');

    if (error) {
      console.error('❌ SimplifiedGoalAssignmentService: Error fetching unassigned goals:', error);
      throw error;
    }

    console.log(`📊 SimplifiedGoalAssignmentService: Found ${events?.length || 0} unassigned goals`);
    return events || [];

  } catch (error) {
    console.error('❌ SimplifiedGoalAssignmentService: Critical error fetching unassigned goals:', error);
    throw error;
  }
};
