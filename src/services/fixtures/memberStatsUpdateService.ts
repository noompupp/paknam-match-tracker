
import { supabase } from '@/integrations/supabase/client';

export const incrementMemberGoals = async (memberId: number, incrementBy: number = 1) => {
  console.log('⚽ MemberStatsUpdateService: Incrementing goals for member:', {
    memberId,
    incrementBy
  });

  try {
    // First, fetch current stats with error handling
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('id, name, goals')
      .eq('id', memberId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ MemberStatsUpdateService: Error fetching member:', fetchError);
      
      if (fetchError.code === 'PGRST116') {
        console.warn(`⚠️ MemberStatsUpdateService: Member ${memberId} not found, skipping goals update`);
        return;
      }
      
      throw new Error(`Failed to fetch member data: ${fetchError.message}`);
    }

    if (!member) {
      console.warn(`⚠️ MemberStatsUpdateService: Member ${memberId} not found, skipping goals update`);
      return;
    }

    const currentGoals = member.goals || 0;
    const newGoals = Math.max(0, currentGoals + incrementBy);

    // Update the goals
    const { data: updatedMember, error: updateError } = await supabase
      .from('members')
      .update({ goals: newGoals })
      .eq('id', memberId)
      .select('id, name, goals')
      .single();

    if (updateError) {
      console.error('❌ MemberStatsUpdateService: Error updating goals:', updateError);
      throw new Error(`Failed to update goals: ${updateError.message}`);
    }

    console.log('✅ MemberStatsUpdateService: Goals updated successfully:', {
      member: updatedMember.name,
      previousGoals: currentGoals,
      newGoals: updatedMember.goals
    });

    return updatedMember;

  } catch (error) {
    console.error('❌ MemberStatsUpdateService: Critical error incrementing goals:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      console.warn(`⚠️ MemberStatsUpdateService: Continuing despite member not found error for member ${memberId}`);
      return;
    }
    
    throw error;
  }
};

export const incrementMemberAssists = async (memberId: number, incrementBy: number = 1) => {
  console.log('🎯 MemberStatsUpdateService: Incrementing assists for member:', {
    memberId,
    incrementBy
  });

  try {
    // First, fetch current stats with error handling
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('id, name, assists')
      .eq('id', memberId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ MemberStatsUpdateService: Error fetching member:', fetchError);
      
      if (fetchError.code === 'PGRST116') {
        console.warn(`⚠️ MemberStatsUpdateService: Member ${memberId} not found, skipping assists update`);
        return;
      }
      
      throw new Error(`Failed to fetch member data: ${fetchError.message}`);
    }

    if (!member) {
      console.warn(`⚠️ MemberStatsUpdateService: Member ${memberId} not found, skipping assists update`);
      return;
    }

    const currentAssists = member.assists || 0;
    const newAssists = Math.max(0, currentAssists + incrementBy);

    // Update the assists
    const { data: updatedMember, error: updateError } = await supabase
      .from('members')
      .update({ assists: newAssists })
      .eq('id', memberId)
      .select('id, name, assists')
      .single();

    if (updateError) {
      console.error('❌ MemberStatsUpdateService: Error updating assists:', updateError);
      throw new Error(`Failed to update assists: ${updateError.message}`);
    }

    console.log('✅ MemberStatsUpdateService: Assists updated successfully:', {
      member: updatedMember.name,
      previousAssists: currentAssists,
      newAssists: updatedMember.assists
    });

    return updatedMember;

  } catch (error) {
    console.error('❌ MemberStatsUpdateService: Critical error incrementing assists:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      console.warn(`⚠️ MemberStatsUpdateService: Continuing despite member not found error for member ${memberId}`);
      return;
    }
    
    throw error;
  }
};

export const incrementMemberCards = async (memberId: number, cardType: 'yellow' | 'red', incrementBy: number = 1) => {
  console.log('🟨🟥 MemberStatsUpdateService: Incrementing cards for member:', {
    memberId,
    cardType,
    incrementBy
  });

  try {
    const cardField = cardType === 'yellow' ? 'yellow_cards' : 'red_cards';

    // First, fetch current stats with error handling
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select(`id, name, ${cardField}`)
      .eq('id', memberId)
      .maybeSingle();

    if (fetchError) {
      console.error(`❌ MemberStatsUpdateService: Error fetching member ${memberId}:`, fetchError);
      
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
    const newCards = Math.max(0, currentCards + incrementBy);

    // Update the card count
    const { data: updatedMember, error: updateError } = await supabase
      .from('members')
      .update({ [cardField]: newCards })
      .eq('id', memberId)
      .select(`id, name, ${cardField}`)
      .single();

    if (updateError) {
      console.error(`❌ MemberStatsUpdateService: Error updating ${cardType} cards:`, updateError);
      throw new Error(`Failed to update ${cardType} cards: ${updateError.message}`);
    }

    console.log(`✅ MemberStatsUpdateService: ${cardType} cards updated successfully:`, {
      member: updatedMember.name,
      previousCards: currentCards,
      newCards: updatedMember[cardField]
    });

    return updatedMember;

  } catch (error) {
    console.error(`❌ MemberStatsUpdateService: Critical error incrementing ${cardType} cards for member ${memberId}:`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      console.warn(`⚠️ MemberStatsUpdateService: Continuing despite member not found error for member ${memberId}`);
      return;
    }
    
    throw error;
  }
};
