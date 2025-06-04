
import { supabase } from '@/integrations/supabase/client';

interface MemberStatsUpdate {
  memberId: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
  matchesPlayed?: number;
}

export const updateMemberStats = async (updates: MemberStatsUpdate[]): Promise<void> => {
  console.log('👥 MemberStatsUpdateService: Starting comprehensive member stats updates:', updates);
  
  if (updates.length === 0) {
    console.log('👥 MemberStatsUpdateService: No member stats to update');
    return;
  }

  try {
    const updatePromises = updates.map(async (update) => {
      const { memberId, goals, assists, yellowCards, redCards, minutesPlayed, matchesPlayed } = update;
      
      // Build the update object dynamically
      const updateData: any = {};
      if (goals !== undefined) updateData.goals = goals;
      if (assists !== undefined) updateData.assists = assists;
      if (yellowCards !== undefined) updateData.yellow_cards = yellowCards;
      if (redCards !== undefined) updateData.red_cards = redCards;
      if (minutesPlayed !== undefined) updateData.total_minutes_played = minutesPlayed;
      if (matchesPlayed !== undefined) updateData.matches_played = matchesPlayed;
      
      if (Object.keys(updateData).length === 0) {
        console.log(`👥 MemberStatsUpdateService: No updates for member ${memberId}`);
        return null;
      }

      console.log(`👥 MemberStatsUpdateService: Updating member ${memberId}:`, updateData);
      
      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', memberId)
        .select()
        .single();

      if (error) {
        console.error(`❌ MemberStatsUpdateService: Error updating member ${memberId}:`, error);
        throw error;
      }

      console.log(`✅ MemberStatsUpdateService: Updated member ${memberId}:`, data);
      return data;
    });

    const results = await Promise.all(updatePromises);
    const successful = results.filter(result => result !== null);
    
    console.log(`✅ MemberStatsUpdateService: Successfully updated ${successful.length} members`);

  } catch (error) {
    console.error('❌ MemberStatsUpdateService: Critical error updating member stats:', error);
    throw error;
  }
};

export const incrementMemberGoals = async (memberId: number, additionalGoals: number = 1): Promise<void> => {
  console.log(`⚽ MemberStatsUpdateService: Incrementing goals for member ${memberId} by ${additionalGoals}`);
  
  try {
    if (!memberId || memberId <= 0) {
      throw new Error('Invalid member ID: Must be a positive number');
    }
    if (additionalGoals < 0) {
      throw new Error('Additional goals must be non-negative');
    }

    // Get current stats
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('id, name, goals')
      .eq('id', memberId)
      .single();

    if (fetchError) {
      console.error(`❌ MemberStatsUpdateService: Error fetching member ${memberId}:`, fetchError);
      throw new Error(`Failed to fetch member data: ${fetchError.message}`);
    }

    if (!member) {
      throw new Error(`Member with ID ${memberId} not found`);
    }

    const currentGoals = member.goals || 0;
    const newGoalCount = currentGoals + additionalGoals;
    
    console.log(`📊 MemberStatsUpdateService: Updating goals for ${member.name}: ${currentGoals} → ${newGoalCount}`);
    
    const { data, error } = await supabase
      .from('members')
      .update({ goals: newGoalCount })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.error(`❌ MemberStatsUpdateService: Error incrementing goals for member ${memberId}:`, error);
      throw new Error(`Failed to update goals: ${error.message}`);
    }

    console.log(`✅ MemberStatsUpdateService: Member ${member.name} goals updated successfully: ${currentGoals} → ${newGoalCount}`);

  } catch (error) {
    console.error(`❌ MemberStatsUpdateService: Critical error incrementing goals for member ${memberId}:`, error);
    throw error;
  }
};

export const incrementMemberAssists = async (memberId: number, additionalAssists: number = 1): Promise<void> => {
  console.log(`🎯 MemberStatsUpdateService: Incrementing assists for member ${memberId} by ${additionalAssists}`);
  
  try {
    if (!memberId || memberId <= 0) {
      throw new Error('Invalid member ID: Must be a positive number');
    }
    if (additionalAssists < 0) {
      throw new Error('Additional assists must be non-negative');
    }

    // Get current stats
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('id, name, assists')
      .eq('id', memberId)
      .single();

    if (fetchError) {
      console.error(`❌ MemberStatsUpdateService: Error fetching member ${memberId}:`, fetchError);
      throw new Error(`Failed to fetch member data: ${fetchError.message}`);
    }

    if (!member) {
      throw new Error(`Member with ID ${memberId} not found`);
    }

    const currentAssists = member.assists || 0;
    const newAssistCount = currentAssists + additionalAssists;
    
    console.log(`📊 MemberStatsUpdateService: Updating assists for ${member.name}: ${currentAssists} → ${newAssistCount}`);
    
    const { data, error } = await supabase
      .from('members')
      .update({ assists: newAssistCount })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.error(`❌ MemberStatsUpdateService: Error incrementing assists for member ${memberId}:`, error);
      throw new Error(`Failed to update assists: ${error.message}`);
    }

    console.log(`✅ MemberStatsUpdateService: Member ${member.name} assists updated successfully: ${currentAssists} → ${newAssistCount}`);

  } catch (error) {
    console.error(`❌ MemberStatsUpdateService: Critical error incrementing assists for member ${memberId}:`, error);
    throw error;
  }
};

export const incrementMemberCards = async (memberId: number, cardType: 'yellow' | 'red', additionalCards: number = 1): Promise<void> => {
  console.log(`🟨🟥 MemberStatsUpdateService: Incrementing ${cardType} cards for member ${memberId} by ${additionalCards}`);
  
  try {
    if (!memberId || memberId <= 0) {
      throw new Error('Invalid member ID: Must be a positive number');
    }
    if (additionalCards < 0) {
      throw new Error('Additional cards must be non-negative');
    }
    if (!['yellow', 'red'].includes(cardType)) {
      throw new Error('Card type must be yellow or red');
    }

    const cardField = cardType === 'yellow' ? 'yellow_cards' : 'red_cards';

    // Get current stats
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select(`id, name, ${cardField}`)
      .eq('id', memberId)
      .single();

    if (fetchError) {
      console.error(`❌ MemberStatsUpdateService: Error fetching member ${memberId}:`, fetchError);
      
      // If member not found, log warning but don't throw error to prevent breaking the flow
      if (fetchError.code === 'PGRST116') {
        console.warn(`⚠️ MemberStatsUpdateService: Member ${memberId} not found, skipping card stats update`);
        return;
      }
      
      throw new Error(`Failed to fetch member data: ${fetchError.message}`);
    }

    if (!member) {
      console.warn(`⚠️ MemberStatsUpdateService: Member ${memberId} not found, skipping card stats update`);
      return;
    }

    const currentCards = member[cardField] || 0;
    const newCardCount = currentCards + additionalCards;
    
    console.log(`📊 MemberStatsUpdateService: Updating ${cardType} cards for ${member.name}: ${currentCards} → ${newCardCount}`);
    
    const updateData = { [cardField]: newCardCount };
    const { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.error(`❌ MemberStatsUpdateService: Error incrementing ${cardType} cards for member ${memberId}:`, error);
      throw new Error(`Failed to update ${cardType} cards: ${error.message}`);
    }

    console.log(`✅ MemberStatsUpdateService: Member ${member.name} ${cardType} cards updated successfully: ${currentCards} → ${newCardCount}`);

  } catch (error) {
    console.error(`❌ MemberStatsUpdateService: Critical error incrementing ${cardType} cards for member ${memberId}:`, error);
    
    // Don't re-throw member not found errors to prevent breaking the main flow
    if (error instanceof Error && error.message.includes('not found')) {
      console.warn(`⚠️ MemberStatsUpdateService: Continuing despite member not found error for member ${memberId}`);
      return;
    }
    
    throw error;
  }
};
