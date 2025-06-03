
import { supabase } from '@/integrations/supabase/client';
import { Team, Member, Fixture, MatchEvent } from '@/types/database';

// Teams API
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
    
    // Transform the data to match the expected interface
    return data?.map(team => ({
      id: team.id || 0,
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
    })) as Team[] || [];
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
    
    return data as Team;
  }
};

// Members API
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
    
    return data?.map(member => ({
      id: member.id || 0,
      name: member.name || '',
      number: parseInt(member.number) || 0,
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
    })) as Member[] || [];
  },

  getByTeam: async (teamId: number) => {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        team:teams!members_team_id_fkey(*)
      `)
      .eq('team_id', teamId.toString())
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
    
    return data?.map(member => ({
      id: member.id || 0,
      name: member.name || '',
      number: parseInt(member.number) || 0,
      position: member.position || 'Player',
      role: member.role || 'Player',
      goals: member.goals || 0,
      assists: member.assists || 0,
      team_id: teamId,
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
    })) as Member[] || [];
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
    
    return data as Member;
  }
};

// Fixtures API
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
    
    return data?.map(fixture => ({
      id: fixture.id || 0,
      home_team_id: fixture.home_team_id ? parseInt(fixture.home_team_id) : 0,
      away_team_id: fixture.away_team_id ? parseInt(fixture.away_team_id) : 0,
      match_date: fixture.match_date || fixture.date?.toString() || '',
      match_time: fixture.match_time?.toString() || fixture.time?.toString() || '',
      home_score: fixture.home_score,
      away_score: fixture.away_score,
      status: (fixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'scheduled',
      venue: fixture.venue,
      created_at: new Date().toISOString(),
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
    })) as Fixture[] || [];
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
    
    return data?.map(fixture => ({
      id: fixture.id || 0,
      home_team_id: fixture.home_team_id ? parseInt(fixture.home_team_id) : 0,
      away_team_id: fixture.away_team_id ? parseInt(fixture.away_team_id) : 0,
      match_date: fixture.match_date || fixture.date?.toString() || '',
      match_time: fixture.match_time?.toString() || fixture.time?.toString() || '',
      home_score: fixture.home_score,
      away_score: fixture.away_score,
      status: (fixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'scheduled',
      venue: fixture.venue,
      created_at: new Date().toISOString(),
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
    })) as Fixture[] || [];
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
    
    return data?.map(fixture => ({
      id: fixture.id || 0,
      home_team_id: fixture.home_team_id ? parseInt(fixture.home_team_id) : 0,
      away_team_id: fixture.away_team_id ? parseInt(fixture.away_team_id) : 0,
      match_date: fixture.match_date || fixture.date?.toString() || '',
      match_time: fixture.match_time?.toString() || fixture.time?.toString() || '',
      home_score: fixture.home_score,
      away_score: fixture.away_score,
      status: (fixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'scheduled',
      venue: fixture.venue,
      created_at: new Date().toISOString(),
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
    })) as Fixture[] || [];
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
    
    return data as Fixture;
  }
};

// Match Events API (simplified for now as this table doesn't exist yet)
export const matchEventsApi = {
  getByFixture: async (fixtureId: number) => {
    // For now, return empty array as match_events table doesn't exist
    console.log('Match events not implemented yet for fixture:', fixtureId);
    return [] as MatchEvent[];
  },

  create: async (event: Omit<MatchEvent, 'id' | 'created_at'>) => {
    // For now, return a mock event
    console.log('Match event creation not implemented yet:', event);
    return {
      id: Date.now(),
      ...event,
      created_at: new Date().toISOString()
    } as MatchEvent;
  }
};
