
import { supabase } from '@/integrations/supabase/client';

export const fetchAllMembers = async () => {
  console.log('🔍 MemberQueries: Starting getAll request...');
  
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true });
  
  if (membersError) {
    console.error('❌ MemberQueries: Error fetching members:', membersError);
    throw membersError;
  }
  
  console.log('📊 MemberQueries: Raw members data from database:', {
    count: members?.length || 0,
    sample: members?.[0] || null
  });
  
  return members || [];
};

export const fetchAllTeams = async () => {
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*');
  
  if (teamsError) {
    console.error('❌ MemberQueries: Error fetching teams for members:', teamsError);
    throw teamsError;
  }

  console.log('📊 MemberQueries: Teams data for joining:', {
    count: teams?.length || 0,
    sample: teams?.[0] || null
  });
  
  return teams || [];
};

export const fetchTeamByNumericId = async (teamId: number) => {
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('__id__, name, *')
    .eq('id', teamId)
    .single();
  
  if (teamError || !team) {
    console.warn('⚠️ MemberQueries: No team found for id:', teamId, teamError);
    return null;
  }

  console.log('✅ MemberQueries: Found team:', {
    numericId: teamId,
    textId: team.__id__,
    name: team.name
  });
  
  return team;
};

export const fetchMembersByTeamFilter = async (normalizedTeamId: string) => {
  const { data: allMembers, error: membersError } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true });
  
  if (membersError) {
    console.error('❌ MemberQueries: Error fetching all members:', membersError);
    throw membersError;
  }

  return allMembers || [];
};

export const updateMemberStats = async (id: number, stats: { goals?: number; assists?: number }) => {
  console.log('🔍 MemberQueries: Updating member stats:', { id, stats });
  
  const { data, error } = await supabase
    .from('members')
    .update(stats)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('❌ MemberQueries: Error updating member stats:', error);
    throw error;
  }
  
  console.log('✅ MemberQueries: Successfully updated member:', data);
  
  return data;
};
