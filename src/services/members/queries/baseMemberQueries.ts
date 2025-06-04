
import { supabase } from '@/integrations/supabase/client';

export const fetchAllMembers = async () => {
  console.log('🔍 BaseMemberQueries: Starting getAll request...');
  
  // First try with the inner join
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select(`
      id,
      name,
      nickname,
      number,
      position,
      role,
      team_id,
      goals,
      assists,
      yellow_cards,
      red_cards,
      total_minutes_played,
      matches_played,
      created_at,
      updated_at,
      teams(
        id,
        __id__,
        name,
        logo,
        color
      )
    `)
    .order('name', { ascending: true });
  
  if (membersError) {
    console.error('❌ BaseMemberQueries: Error fetching members:', membersError);
    throw membersError;
  }
  
  console.log('📊 BaseMemberQueries: Enhanced members data from database:', {
    count: members?.length || 0,
    sample: members?.[0] || null
  });
  
  return members || [];
};

export const fetchMembersByTeamFilter = async (normalizedTeamId: string) => {
  const { data: allMembers, error: membersError } = await supabase
    .from('members')
    .select(`
      id,
      name,
      nickname,
      number,
      position,
      role,
      team_id,
      goals,
      assists,
      yellow_cards,
      red_cards,
      total_minutes_played,
      matches_played,
      created_at,
      updated_at,
      teams(
        id,
        __id__,
        name,
        logo,
        color
      )
    `)
    .order('name', { ascending: true });
  
  if (membersError) {
    console.error('❌ BaseMemberQueries: Error fetching all members:', membersError);
    throw membersError;
  }

  return allMembers || [];
};

export const updateMemberStats = async (id: number, stats: { goals?: number; assists?: number; yellow_cards?: number; red_cards?: number; total_minutes_played?: number; matches_played?: number }) => {
  console.log('🔍 BaseMemberQueries: Updating member stats:', { id, stats });
  
  const { data, error } = await supabase
    .from('members')
    .update(stats)
    .eq('id', id)
    .select(`
      id,
      name,
      nickname,
      number,
      position,
      role,
      team_id,
      goals,
      assists,
      yellow_cards,
      red_cards,
      total_minutes_played,
      matches_played,
      teams(
        id,
        __id__,
        name,
        logo,
        color
      )
    `)
    .single();
  
  if (error) {
    console.error('❌ BaseMemberQueries: Error updating member stats:', error);
    throw error;
  }
  
  console.log('✅ BaseMemberQueries: Successfully updated member:', data);
  
  return data;
};
