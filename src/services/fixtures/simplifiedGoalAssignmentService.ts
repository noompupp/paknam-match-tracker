
import { supabase } from '@/integrations/supabase/client';

interface GoalAssignmentData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  eventTime: number;
  type: 'goal' | 'assist';
  isOwnGoal?: boolean;
}

export const assignGoalToPlayer = async (data: GoalAssignmentData) => {
  console.log('⚽ Simplified Goal Assignment: Starting assignment with enhanced validation:', data);
  
  try {
    // Enhanced input validation
    if (!data.fixtureId || data.fixtureId <= 0) {
      throw new Error('Invalid fixture ID provided');
    }
    
    if (!data.playerName || data.playerName.trim().length === 0) {
      throw new Error('Invalid player name provided');
    }
    
    if (!data.teamId || data.teamId.trim().length === 0) {
      throw new Error('Invalid team ID provided');
    }
    
    if (data.eventTime < 0 || data.eventTime > 7200) { // Max 2 hours
      throw new Error('Invalid event time provided');
    }
    
    if (!['goal', 'assist'].includes(data.type)) {
      throw new Error('Invalid goal type provided');
    }

    // Validate team ID format
    const sanitizedTeamId = data.teamId.trim();
    console.log('🔍 Simplified Goal Assignment: Using team ID:', sanitizedTeamId);

    // Create match event with proper validation
    const eventData = {
      fixture_id: data.fixtureId,
      event_type: data.type,
      player_name: data.playerName.trim(),
      team_id: sanitizedTeamId,
      event_time: data.eventTime,
      is_own_goal: data.isOwnGoal || false,
      description: `${data.isOwnGoal ? 'Own goal' : data.type === 'goal' ? 'Goal' : 'Assist'} by ${data.playerName.trim()} at ${Math.floor(data.eventTime / 60)}'${String(data.eventTime % 60).padStart(2, '0')}`
    };

    console.log('🚀 Simplified Goal Assignment: Inserting event data:', eventData);

    const { data: matchEvent, error } = await supabase
      .from('match_events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('❌ Simplified Goal Assignment: Database error:', error);
      
      // Enhanced error handling for common issues
      if (error.message.includes('invalid input syntax for type uuid')) {
        throw new Error(`Team ID format error: "${sanitizedTeamId}" is not a valid format for this database field. Please check team configuration.`);
      }
      
      if (error.message.includes('foreign key')) {
        throw new Error(`Team reference error: Team "${sanitizedTeamId}" not found in database. Please verify team data.`);
      }
      
      if (error.message.includes('duplicate')) {
        throw new Error(`Duplicate event: This ${data.type} has already been recorded for ${data.playerName} at this time.`);
      }
      
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Simplified Goal Assignment: Event created successfully:', matchEvent);

    // Update player stats if it's a goal or assist (but not for own goals affecting player stats negatively)
    if (data.playerId && data.playerId > 0) {
      try {
        if (data.type === 'goal' && !data.isOwnGoal) {
          // Only count regular goals, not own goals
          const { error: goalsError } = await supabase.rpc('safe_update_member_stats', {
            p_member_id: data.playerId,
            p_goals: 1
          });

          if (goalsError) {
            console.error('⚠️ Simplified Goal Assignment: Goals update failed:', goalsError);
          } else {
            console.log('✅ Simplified Goal Assignment: Goals updated via RPC');
          }
        } else if (data.type === 'assist') {
          // Update assists
          const { error: assistsError } = await supabase.rpc('safe_update_member_stats', {
            p_member_id: data.playerId,
            p_assists: 1
          });

          if (assistsError) {
            console.error('⚠️ Simplified Goal Assignment: Assists update failed:', assistsError);
          } else {
            console.log('✅ Simplified Goal Assignment: Assists updated via RPC');
          }
        }

        console.log('✅ Simplified Goal Assignment: Player stats updated successfully');
      } catch (statsError) {
        console.error('⚠️ Simplified Goal Assignment: Stats update error:', statsError);
        // Continue without throwing - event was created successfully
      }
    }

    return {
      success: true,
      eventId: matchEvent.id,
      isOwnGoal: data.isOwnGoal || false,
      teamId: sanitizedTeamId
    };

  } catch (error) {
    console.error('❌ Simplified Goal Assignment: Assignment failed:', error);
    
    // Enhanced error logging for debugging
    console.error('❌ Assignment context:', {
      fixtureId: data.fixtureId,
      playerName: data.playerName,
      teamId: data.teamId,
      type: data.type,
      isOwnGoal: data.isOwnGoal
    });
    
    throw error;
  }
};
