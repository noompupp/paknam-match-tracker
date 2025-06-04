
import { supabase } from '@/integrations/supabase/client';

interface PlayerStatsUpdate {
  playerId: number;
  goals?: number;
  assists?: number;
}

export const updatePlayerStats = async (updates: PlayerStatsUpdate[]): Promise<void> => {
  console.log('👥 PlayerStatsUpdateService: Starting comprehensive player stats updates:', updates);
  
  if (updates.length === 0) {
    console.log('👥 PlayerStatsUpdateService: No player stats to update');
    return;
  }

  try {
    const updatePromises = updates.map(async (update) => {
      const { playerId, goals, assists } = update;
      
      // Build the update object dynamically
      const updateData: any = {};
      if (goals !== undefined) updateData.goals = goals;
      if (assists !== undefined) updateData.assists = assists;
      
      if (Object.keys(updateData).length === 0) {
        console.log(`👥 PlayerStatsUpdateService: No updates for player ${playerId}`);
        return null;
      }

      console.log(`👥 PlayerStatsUpdateService: Updating player ${playerId}:`, updateData);
      
      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', playerId)
        .select()
        .single();

      if (error) {
        console.error(`❌ PlayerStatsUpdateService: Error updating player ${playerId}:`, error);
        throw error;
      }

      console.log(`✅ PlayerStatsUpdateService: Updated player ${playerId}:`, data);
      return data;
    });

    const results = await Promise.all(updatePromises);
    const successful = results.filter(result => result !== null);
    
    console.log(`✅ PlayerStatsUpdateService: Successfully updated ${successful.length} players`);

  } catch (error) {
    console.error('❌ PlayerStatsUpdateService: Critical error updating player stats:', error);
    throw error;
  }
};

export const incrementPlayerGoals = async (playerId: number, additionalGoals: number = 1): Promise<void> => {
  console.log(`⚽ PlayerStatsUpdateService: Incrementing goals for player ${playerId} by ${additionalGoals}`);
  
  try {
    // Validate inputs
    if (!playerId || playerId <= 0) {
      throw new Error('Invalid player ID: Must be a positive number');
    }
    if (additionalGoals < 0) {
      throw new Error('Additional goals must be non-negative');
    }

    // First get current stats with proper error handling
    const { data: player, error: fetchError } = await supabase
      .from('members')
      .select('id, name, goals')
      .eq('id', playerId)
      .single();

    if (fetchError) {
      console.error(`❌ PlayerStatsUpdateService: Error fetching player ${playerId}:`, fetchError);
      throw new Error(`Failed to fetch player data: ${fetchError.message}`);
    }

    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    const currentGoals = player.goals || 0;
    const newGoalCount = currentGoals + additionalGoals;
    
    console.log(`📊 PlayerStatsUpdateService: Updating goals for ${player.name}: ${currentGoals} → ${newGoalCount}`);
    
    const { data, error } = await supabase
      .from('members')
      .update({ goals: newGoalCount })
      .eq('id', playerId)
      .select()
      .single();

    if (error) {
      console.error(`❌ PlayerStatsUpdateService: Error incrementing goals for player ${playerId}:`, error);
      throw new Error(`Failed to update goals: ${error.message}`);
    }

    console.log(`✅ PlayerStatsUpdateService: Player ${player.name} goals updated successfully: ${currentGoals} → ${newGoalCount}`);

  } catch (error) {
    console.error(`❌ PlayerStatsUpdateService: Critical error incrementing goals for player ${playerId}:`, error);
    throw error;
  }
};

export const incrementPlayerAssists = async (playerId: number, additionalAssists: number = 1): Promise<void> => {
  console.log(`🎯 PlayerStatsUpdateService: Incrementing assists for player ${playerId} by ${additionalAssists}`);
  
  try {
    // Validate inputs
    if (!playerId || playerId <= 0) {
      throw new Error('Invalid player ID: Must be a positive number');
    }
    if (additionalAssists < 0) {
      throw new Error('Additional assists must be non-negative');
    }

    // First get current stats with proper error handling
    const { data: player, error: fetchError } = await supabase
      .from('members')
      .select('id, name, assists')
      .eq('id', playerId)
      .single();

    if (fetchError) {
      console.error(`❌ PlayerStatsUpdateService: Error fetching player ${playerId}:`, fetchError);
      throw new Error(`Failed to fetch player data: ${fetchError.message}`);
    }

    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    const currentAssists = player.assists || 0;
    const newAssistCount = currentAssists + additionalAssists;
    
    console.log(`📊 PlayerStatsUpdateService: Updating assists for ${player.name}: ${currentAssists} → ${newAssistCount}`);
    
    const { data, error } = await supabase
      .from('members')
      .update({ assists: newAssistCount })
      .eq('id', playerId)
      .select()
      .single();

    if (error) {
      console.error(`❌ PlayerStatsUpdateService: Error incrementing assists for player ${playerId}:`, error);
      throw new Error(`Failed to update assists: ${error.message}`);
    }

    console.log(`✅ PlayerStatsUpdateService: Player ${player.name} assists updated successfully: ${currentAssists} → ${newAssistCount}`);

  } catch (error) {
    console.error(`❌ PlayerStatsUpdateService: Critical error incrementing assists for player ${playerId}:`, error);
    throw error;
  }
};

export const validateAndSyncPlayerStats = async (playerId: number): Promise<{ isValid: boolean; issues: string[] }> => {
  console.log(`🔍 PlayerStatsUpdateService: Validating stats for player ${playerId}`);
  
  const result = { isValid: true, issues: [] as string[] };
  
  try {
    // Get player data
    const { data: player, error: playerError } = await supabase
      .from('members')
      .select('id, name, goals, assists')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      result.isValid = false;
      result.issues.push(`Player ${playerId} not found`);
      return result;
    }

    // Count actual goals and assists from match events
    const { data: goalEvents, error: goalError } = await supabase
      .from('match_events')
      .select('id')
      .eq('player_name', player.name)
      .eq('event_type', 'goal');

    const { data: assistEvents, error: assistError } = await supabase
      .from('match_events')
      .select('id')
      .eq('player_name', player.name)
      .eq('event_type', 'assist');

    if (goalError || assistError) {
      result.isValid = false;
      result.issues.push(`Error fetching events for ${player.name}`);
      return result;
    }

    const actualGoals = goalEvents?.length || 0;
    const actualAssists = assistEvents?.length || 0;
    const profileGoals = player.goals || 0;
    const profileAssists = player.assists || 0;

    if (actualGoals !== profileGoals) {
      result.isValid = false;
      result.issues.push(`${player.name}: Goals mismatch - Events: ${actualGoals}, Profile: ${profileGoals}`);
    }

    if (actualAssists !== profileAssists) {
      result.isValid = false;
      result.issues.push(`${player.name}: Assists mismatch - Events: ${actualAssists}, Profile: ${profileAssists}`);
    }

    console.log(`📊 PlayerStatsUpdateService: Validation complete for ${player.name}:`, {
      goalEvents: actualGoals,
      profileGoals,
      assistEvents: actualAssists,
      profileAssists,
      isValid: result.isValid
    });

    return result;

  } catch (error) {
    console.error(`❌ PlayerStatsUpdateService: Error validating player ${playerId}:`, error);
    result.isValid = false;
    result.issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};
