
import { supabase } from '@/integrations/supabase/client';

interface PlayerStatsUpdate {
  playerId: number;
  goals?: number;
  assists?: number;
}

export const updatePlayerStats = async (updates: PlayerStatsUpdate[]): Promise<void> => {
  console.log('👥 PlayerStatsUpdateService: Starting player stats updates:', updates);
  
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
    // First get current stats
    const { data: player, error: fetchError } = await supabase
      .from('members')
      .select('id, name, goals')
      .eq('id', playerId)
      .single();

    if (fetchError) {
      console.error(`❌ PlayerStatsUpdateService: Error fetching player ${playerId}:`, fetchError);
      throw fetchError;
    }

    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    const newGoalCount = (player.goals || 0) + additionalGoals;
    
    const { data, error } = await supabase
      .from('members')
      .update({ goals: newGoalCount })
      .eq('id', playerId)
      .select()
      .single();

    if (error) {
      console.error(`❌ PlayerStatsUpdateService: Error incrementing goals for player ${playerId}:`, error);
      throw error;
    }

    console.log(`✅ PlayerStatsUpdateService: Player ${player.name} goals updated: ${player.goals || 0} → ${newGoalCount}`);

  } catch (error) {
    console.error(`❌ PlayerStatsUpdateService: Critical error incrementing goals for player ${playerId}:`, error);
    throw error;
  }
};

export const incrementPlayerAssists = async (playerId: number, additionalAssists: number = 1): Promise<void> => {
  console.log(`🎯 PlayerStatsUpdateService: Incrementing assists for player ${playerId} by ${additionalAssists}`);
  
  try {
    // First get current stats
    const { data: player, error: fetchError } = await supabase
      .from('members')
      .select('id, name, assists')
      .eq('id', playerId)
      .single();

    if (fetchError) {
      console.error(`❌ PlayerStatsUpdateService: Error fetching player ${playerId}:`, fetchError);
      throw fetchError;
    }

    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    const newAssistCount = (player.assists || 0) + additionalAssists;
    
    const { data, error } = await supabase
      .from('members')
      .update({ assists: newAssistCount })
      .eq('id', playerId)
      .select()
      .single();

    if (error) {
      console.error(`❌ PlayerStatsUpdateService: Error incrementing assists for player ${playerId}:`, error);
      throw error;
    }

    console.log(`✅ PlayerStatsUpdateService: Player ${player.name} assists updated: ${player.assists || 0} → ${newAssistCount}`);

  } catch (error) {
    console.error(`❌ PlayerStatsUpdateService: Critical error incrementing assists for player ${playerId}:`, error);
    throw error;
  }
};
