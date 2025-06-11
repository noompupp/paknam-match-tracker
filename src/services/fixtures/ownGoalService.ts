
import { supabase } from '@/integrations/supabase/client';
import { incrementMemberGoals } from './memberStatsUpdateService';

interface OwnGoalData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  eventTime: number;
}

export const assignOwnGoalToPlayer = async (data: OwnGoalData) => {
  console.log('🥅 OwnGoalService: Processing own goal assignment:', data);
  
  try {
    // Enhanced input validation for own goals
    if (!data.playerId || !data.playerName?.trim() || !data.teamId?.trim() || !data.fixtureId) {
      throw new Error('Missing required data for own goal assignment');
    }

    if (data.eventTime < 0) {
      throw new Error('Invalid event time provided');
    }

    const teamIdString = String(data.teamId).trim();

    console.log('✅ OwnGoalService: Input validation passed for own goal:', {
      playerId: data.playerId,
      playerName: data.playerName,
      teamId: teamIdString,
      eventTime: data.eventTime
    });

    // Enhanced duplicate check specifically for own goals
    const { data: existingOwnGoals, error: duplicateCheckError } = await supabase
      .from('match_events')
      .select('id')
      .eq('fixture_id', data.fixtureId)
      .eq('event_type', 'goal')
      .eq('player_name', data.playerName)
      .eq('team_id', teamIdString)
      .eq('own_goal', true)
      .gte('event_time', Math.max(0, data.eventTime - 10))
      .lte('event_time', data.eventTime + 10);

    if (duplicateCheckError) {
      console.error('❌ OwnGoalService: Duplicate check failed:', duplicateCheckError);
      throw new Error(`Failed to check for duplicate own goals: ${duplicateCheckError.message}`);
    }

    if (existingOwnGoals && existingOwnGoals.length > 0) {
      console.warn('🚫 OwnGoalService: Duplicate own goal prevented');
      throw new Error(`This own goal has already been assigned to ${data.playerName} at this time`);
    }

    // Create match event specifically for own goal
    const { data: matchEvent, error: eventError } = await supabase
      .from('match_events')
      .insert({
        fixture_id: data.fixtureId,
        event_type: 'goal',
        player_name: data.playerName,
        team_id: data.teamId,
        event_time: data.eventTime,
        own_goal: true,
        description: `Own Goal by ${data.playerName} at ${Math.floor(data.eventTime / 60)}'${String(data.eventTime % 60).padStart(2, '0')}`
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ OwnGoalService: Error creating own goal event:', eventError);
      throw new Error(`Failed to create own goal event: ${eventError.message}`);
    }

    console.log('✅ OwnGoalService: Own goal match event created successfully:', matchEvent);

    // For own goals, we do NOT increment the player's goal stats
    // Own goals are tracked separately and don't count toward player achievements
    console.log('ℹ️ OwnGoalService: Own goal recorded, player stats NOT incremented (as expected)');

    console.log('✅ OwnGoalService: Own goal assignment completed successfully');
    return matchEvent;

  } catch (error) {
    console.error('❌ OwnGoalService: Critical error:', error);
    throw error;
  }
};

export const getOwnGoalsByFixture = async (fixtureId: number) => {
  console.log('🔍 OwnGoalService: Getting own goals for fixture:', fixtureId);
  
  try {
    if (!fixtureId || fixtureId <= 0) {
      throw new Error('Invalid fixture ID provided');
    }

    const { data: ownGoals, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', 'goal')
      .eq('own_goal', true)
      .order('event_time', { ascending: true });

    if (error) {
      console.error('❌ OwnGoalService: Error fetching own goals:', error);
      throw error;
    }

    console.log(`📊 OwnGoalService: Found ${ownGoals?.length || 0} own goals`);
    return ownGoals || [];

  } catch (error) {
    console.error('❌ OwnGoalService: Critical error fetching own goals:', error);
    throw error;
  }
};
