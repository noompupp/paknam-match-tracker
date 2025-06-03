
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types/database';

export const teamsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
    
    console.log('Raw teams data from database:', data);
    
    // Transform the data to match the expected interface
    return data?.map(team => ({
      id: team.id || 0, // Use the auto-increment id field
      name: team.name || '',
      logo: team.logo || '⚽',
      founded: team.founded || '2020',
      captain: team.captain || '',
      position: team.position || 1,
      points: team.points || 0,
      played: team.played || 0,
      won: team.won || 0,
      drawn: team.drawn || 0,
      lost: team.lost || 0,
      goals_for: team.goals_for || 0,
      goals_against: team.goals_against || 0,
      goal_difference: team.goal_difference || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Team)) || [];
  },

  getById: async (id: number) => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
    
    return {
      id: data.id || 0,
      name: data.name || '',
      logo: data.logo || '⚽',
      founded: data.founded || '2020',
      captain: data.captain || '',
      position: data.position || 1,
      points: data.points || 0,
      played: data.played || 0,
      won: data.won || 0,
      drawn: data.drawn || 0,
      lost: data.lost || 0,
      goals_for: data.goals_for || 0,
      goals_against: data.goals_against || 0,
      goal_difference: data.goal_difference || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Team;
  },

  updateStats: async (id: number, stats: Partial<Team>) => {
    const { data, error } = await supabase
      .from('teams')
      .update(stats)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating team stats:', error);
      throw error;
    }
    
    return {
      id: data.id || 0,
      name: data.name || '',
      logo: data.logo || '⚽',
      founded: data.founded || '2020',
      captain: data.captain || '',
      position: data.position || 1,
      points: data.points || 0,
      played: data.played || 0,
      won: data.won || 0,
      drawn: data.drawn || 0,
      lost: data.lost || 0,
      goals_for: data.goals_for || 0,
      goals_against: data.goals_against || 0,
      goal_difference: data.goal_difference || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Team;
  }
};
