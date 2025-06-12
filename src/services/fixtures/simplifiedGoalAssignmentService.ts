
import { supabase } from '@/integrations/supabase/client';

interface GoalAssignmentData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  eventTime: number;
  type: 'goal' | 'assist';
  isOwnGoal?: boolean; // Standardized own goal flag
}

export const assignGoalToPlayer = async (data: GoalAssignmentData) => {
  console.log('⚽ Simplified Goal Assignment: Assigning with standardized own goal support:', data);
  
  try {
    // Validate input
    if (!data.fixtureId || !data.playerName || data.eventTime < 0) {
      throw new Error('Invalid goal assignment data provided');
    }

    // Create match event with standardized is_own_goal flag
    const { data: matchEvent, error } = await supabase
      .from('match_events')
      .insert({
        fixture_id: data.fixtureId,
        event_type: data.type,
        player_name: data.playerName,
        team_id: data.teamId,
        event_time: data.eventTime,
        is_own_goal: data.isOwnGoal || false, // Use standardized flag
        description: `${data.isOwnGoal ? 'Own goal' : data.type === 'goal' ? 'Goal' : 'Assist'} by ${data.playerName} at ${Math.floor(data.eventTime / 60)}'${String(data.eventTime % 60).padStart(2, '0')}`
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Simplified Goal Assignment: Database error:', error);
      throw error;
    }

    console.log('✅ Simplified Goal Assignment: Event created successfully:', matchEvent);

    // Update player stats if it's a goal or assist (but not for own goals affecting player stats negatively)
    if (data.playerId && data.playerId > 0) {
      try {
        if (data.type === 'goal' && !data.isOwnGoal) {
          // Only count regular goals, not own goals - use RPC for atomic increment
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
          // Update assists using RPC for atomic increment
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

        console.log('✅ Simplified Goal Assignment: Player stats updated');
      } catch (statsError) {
        console.error('⚠️ Simplified Goal Assignment: Stats update error:', statsError);
        // Continue without throwing - event was created successfully
      }
    }

    return {
      success: true,
      eventId: matchEvent.id,
      isOwnGoal: data.isOwnGoal || false
    };

  } catch (error) {
    console.error('❌ Simplified Goal Assignment: Assignment failed:', error);
    throw error;
  }
};
