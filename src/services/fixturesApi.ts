
import { supabase } from '@/integrations/supabase/client';
import { Fixture } from '@/types/database';

const transformFixture = (fixture: any): Fixture => ({
  id: fixture.id || 0,
  home_team_id: fixture.home_team_id ? parseInt(fixture.home_team_id) : 0,
  away_team_id: fixture.away_team_id ? parseInt(fixture.away_team_id) : 0,
  match_date: fixture.match_date || fixture.date?.toString() || '',
  match_time: fixture.match_time?.toString() || fixture.time?.toString() || '',
  home_score: fixture.home_score,
  away_score: fixture.away_score,
  status: (fixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'scheduled',
  venue: fixture.venue,
  created_at: fixture.created_at || new Date().toISOString(),
  updated_at: fixture.updated_at || new Date().toISOString(),
  home_team: fixture.home_team ? {
    id: fixture.home_team.id || 0,
    name: fixture.home_team.name || '',
    logo: fixture.home_team.logo || '⚽',
    founded: fixture.home_team.founded || '2020',
    captain: fixture.home_team.captain || '',
    position: fixture.home_team.position || 1,
    points: fixture.home_team.points || 0,
    played: fixture.home_team.played || 0,
    won: fixture.home_team.won || 0,
    drawn: fixture.home_team.drawn || 0,
    lost: fixture.home_team.lost || 0,
    goals_for: fixture.home_team.goals_for || 0,
    goals_against: fixture.home_team.goals_against || 0,
    goal_difference: fixture.home_team.goal_difference || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : undefined,
  away_team: fixture.away_team ? {
    id: fixture.away_team.id || 0,
    name: fixture.away_team.name || '',
    logo: fixture.away_team.logo || '⚽',
    founded: fixture.away_team.founded || '2020',
    captain: fixture.away_team.captain || '',
    position: fixture.away_team.position || 1,
    points: fixture.away_team.points || 0,
    played: fixture.away_team.played || 0,
    won: fixture.away_team.won || 0,
    drawn: fixture.away_team.drawn || 0,
    lost: fixture.away_team.lost || 0,
    goals_for: fixture.away_team.goals_for || 0,
    goals_against: fixture.away_team.goals_against || 0,
    goal_difference: fixture.away_team.goal_difference || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : undefined
});

export const fixturesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .order('match_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching fixtures:', error);
      throw error;
    }
    
    console.log('Raw fixtures data from database:', data);
    
    return data?.map(transformFixture) || [];
  },

  getUpcoming: async () => {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(5);
    
    if (error) {
      console.error('Error fetching upcoming fixtures:', error);
      throw error;
    }
    
    console.log('Raw upcoming fixtures data from database:', data);
    
    return data?.map(transformFixture) || [];
  },

  getRecent: async () => {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .eq('status', 'completed')
      .order('match_date', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching recent fixtures:', error);
      throw error;
    }
    
    console.log('Raw recent fixtures data from database:', data);
    
    return data?.map(transformFixture) || [];
  },

  updateScore: async (id: number, homeScore: number, awayScore: number) => {
    const { data, error } = await supabase
      .from('fixtures')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'completed'
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fixture score:', error);
      throw error;
    }
    
    return {
      id: data.id || 0,
      home_team_id: data.home_team_id ? parseInt(data.home_team_id) : 0,
      away_team_id: data.away_team_id ? parseInt(data.away_team_id) : 0,
      match_date: data.match_date || data.date?.toString() || '',
      match_time: data.match_time?.toString() || data.time?.toString() || '',
      home_score: data.home_score,
      away_score: data.away_score,
      status: (data.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'scheduled',
      venue: data.venue,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    } as Fixture;
  }
};
