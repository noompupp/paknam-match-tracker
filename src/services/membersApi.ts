
import { supabase } from '@/integrations/supabase/client';
import { Member } from '@/types/database';

export const membersApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        team:teams!members_team_id_fkey(*)
      `)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
    
    console.log('Raw members data from database:', data);
    
    return data?.map(member => ({
      id: member.id || 0,
      name: member.name || '',
      number: parseInt(member.number || '0') || 0,
      position: member.position || 'Player',
      role: member.role || 'Player',
      goals: member.goals || 0,
      assists: member.assists || 0,
      team_id: member.team_id ? parseInt(member.team_id) : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      team: member.team ? {
        id: member.team.id || 0,
        name: member.team.name || '',
        logo: member.team.logo || '⚽',
        founded: member.team.founded || '2020',
        captain: member.team.captain || '',
        position: member.team.position || 1,
        points: member.team.points || 0,
        played: member.team.played || 0,
        won: member.team.won || 0,
        drawn: member.team.drawn || 0,
        lost: member.team.lost || 0,
        goals_for: member.team.goals_for || 0,
        goals_against: member.team.goals_against || 0,
        goal_difference: member.team.goal_difference || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : undefined
    } as Member)) || [];
  },

  getByTeam: async (teamId: number) => {
    // First get the team's __id__ using the numeric id
    const { data: teamData } = await supabase
      .from('teams')
      .select('__id__')
      .eq('id', teamId)
      .single();
    
    if (!teamData) {
      console.log('No team found for id:', teamId);
      return [];
    }
    
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        team:teams!members_team_id_fkey(*)
      `)
      .eq('team_id', teamData.__id__)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
    
    console.log('Raw team members data from database:', data);
    
    return data?.map(member => ({
      id: member.id || 0,
      name: member.name || '',
      number: parseInt(member.number || '0') || 0,
      position: member.position || 'Player',
      role: member.role || 'Player',
      goals: member.goals || 0,
      assists: member.assists || 0,
      team_id: teamId, // Use the numeric team ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      team: member.team ? {
        id: member.team.id || 0,
        name: member.team.name || '',
        logo: member.team.logo || '⚽',
        founded: member.team.founded || '2020',
        captain: member.team.captain || '',
        position: member.team.position || 1,
        points: member.team.points || 0,
        played: member.team.played || 0,
        won: member.team.won || 0,
        drawn: member.team.drawn || 0,
        lost: member.team.lost || 0,
        goals_for: member.team.goals_for || 0,
        goals_against: member.team.goals_against || 0,
        goal_difference: member.team.goal_difference || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : undefined
    } as Member)) || [];
  },

  updateStats: async (id: number, stats: { goals?: number; assists?: number }) => {
    const { data, error } = await supabase
      .from('members')
      .update(stats)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating member stats:', error);
      throw error;
    }
    
    return {
      id: data.id || 0,
      name: data.name || '',
      number: parseInt(data.number || '0') || 0,
      position: data.position || 'Player',
      role: data.role || 'Player',
      goals: data.goals || 0,
      assists: data.assists || 0,
      team_id: data.team_id ? parseInt(data.team_id) : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Member;
  }
};
