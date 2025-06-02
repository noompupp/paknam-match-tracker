
import { supabase } from '@/lib/supabase';
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
    
    return data as Team[];
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
    
    return data as Team;
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
        team:teams(*)
      `)
      .order('team_id', { ascending: true })
      .order('number', { ascending: true });
    
    if (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
    
    return data as Member[];
  },

  getByTeam: async (teamId: number) => {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        team:teams(*)
      `)
      .eq('team_id', teamId)
      .order('number', { ascending: true });
    
    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
    
    return data as Member[];
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
    
    return data as Fixture[];
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
    
    return data as Fixture[];
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
    
    return data as Fixture[];
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

// Match Events API
export const matchEventsApi = {
  getByFixture: async (fixtureId: number) => {
    const { data, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .order('event_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching match events:', error);
      throw error;
    }
    
    return data as MatchEvent[];
  },

  create: async (event: Omit<MatchEvent, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('match_events')
      .insert(event)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating match event:', error);
      throw error;
    }
    
    return data as MatchEvent;
  }
};
