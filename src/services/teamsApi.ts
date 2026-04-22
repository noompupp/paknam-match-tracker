
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types/database';
import { getCurrentSeasonId } from '@/lib/seasonStore';

// Helper function to normalize IDs for consistent matching
const normalizeId = (id: any): string => {
  if (id === null || id === undefined) return '';
  return String(id).trim().toLowerCase();
};

export const teamsApi = {
  getAll: async () => {
    console.log('🔍 TeamsAPI: Starting getAll request...');

    const seasonId = getCurrentSeasonId();
    let q = supabase
      .from('teams')
      .select('*')
      .order('position', { ascending: true });
    if (seasonId) q = q.eq('season_id', seasonId);
    const { data, error } = await q;
    
    if (error) {
      console.error('❌ TeamsAPI: Error fetching teams:', error);
      throw error;
    }
    
    console.log('📊 TeamsAPI: Raw teams data from database:', {
      count: data?.length || 0,
      sample: data?.[0] || null,
      allData: data,
      idAnalysis: data?.map(team => ({
        name: team.name,
        numericId: team.id,
        textId: team.__id__,
        normalizedTextId: normalizeId(team.__id__),
        logoURL: team.logoURL,
        color: team.color,
        position: team.position,
        previousPosition: team.previous_position
      })) || []
    });
    
    if (!data || data.length === 0) {
      console.warn('⚠️ TeamsAPI: No teams found in database');
      return [];
    }
    
    // Transform the data to match the expected interface
    const transformedTeams = data.map(team => {
      console.log('🔄 TeamsAPI: Transforming team:', {
        name: team.name,
        rawNumericId: team.id,
        rawTextId: team.__id__,
        normalizedTextId: normalizeId(team.__id__),
        logoURL: team.logoURL,
        color: team.color,
        position: team.position,
        previousPosition: team.previous_position
      });
      
      const transformed = {
        id: team.id || 0,
        name: team.name || '',
        logo: team.logo || '⚽',
        logoURL: team.logoURL || undefined,
        founded: team.founded || '2020',
        captain: team.captain || '',
        position: team.position || 1,
        previous_position: team.previous_position || null, // Include previous position
        points: team.points || 0,
        played: team.played || 0,
        won: team.won || 0,
        drawn: team.drawn || 0,
        lost: team.lost || 0,
        goals_for: team.goals_for || 0,
        goals_against: team.goals_against || 0,
        goal_difference: team.goal_difference || 0,
        color: team.color || undefined,
        __id__: team.__id__ || undefined, // Include the text ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Team;

      console.log('✅ TeamsAPI: Transformed team:', transformed);
      return transformed;
    });

    console.log('✅ TeamsAPI: Successfully transformed teams:', {
      count: transformedTeams.length,
      teams: transformedTeams
    });
    
    return transformedTeams;
  },

  getById: async (id: number) => {
    console.log('🔍 TeamsAPI: Getting team by ID:', id);
    
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ TeamsAPI: Error fetching team by ID:', error);
      throw error;
    }
    
    console.log('📊 TeamsAPI: Found team:', data);
    
    return {
      id: data.id || 0,
      name: data.name || '',
      logo: data.logo || '⚽',
      logoURL: data.logoURL || undefined,
      founded: data.founded || '2020',
      captain: data.captain || '',
      position: data.position || 1,
      previous_position: data.previous_position || null, // Include previous position
      points: data.points || 0,
      played: data.played || 0,
      won: data.won || 0,
      drawn: data.drawn || 0,
      lost: data.lost || 0,
      goals_for: data.goals_for || 0,
      goals_against: data.goals_against || 0,
      goal_difference: data.goal_difference || 0,
      color: data.color || undefined,
      __id__: data.__id__ || undefined, // Include the text ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Team;
  },

  updateStats: async (id: number, stats: Partial<Team>) => {
    console.log('🔍 TeamsAPI: Updating team stats:', { id, stats });
    
    const { data, error } = await supabase
      .from('teams')
      .update(stats)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ TeamsAPI: Error updating team stats:', error);
      throw error;
    }
    
    console.log('✅ TeamsAPI: Successfully updated team:', data);
    
    return {
      id: data.id || 0,
      name: data.name || '',
      logo: data.logo || '⚽',
      logoURL: data.logoURL || undefined,
      founded: data.founded || '2020',
      captain: data.captain || '',
      position: data.position || 1,
      previous_position: data.previous_position || null, // Include previous position
      points: data.points || 0,
      played: data.played || 0,
      won: data.won || 0,
      drawn: data.drawn || 0,
      lost: data.lost || 0,
      goals_for: data.goals_for || 0,
      goals_against: data.goals_against || 0,
      goal_difference: data.goal_difference || 0,
      color: data.color || undefined,
      __id__: data.__id__ || undefined, // Include the text ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Team;
  }
};
