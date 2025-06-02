
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Team, Member, Fixture, MatchEvent } from '@/types/database';

// Mock data for when Supabase is not configured
const mockTeams: Team[] = [
  {
    id: 1,
    name: "Paknam FC",
    logo: "⚽",
    founded: "2020",
    captain: "John Doe",
    position: 1,
    points: 15,
    played: 6,
    won: 5,
    drawn: 0,
    lost: 1,
    goals_for: 12,
    goals_against: 3,
    goal_difference: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Rangers United",
    logo: "🦅",
    founded: "2019",
    captain: "Mike Johnson",
    position: 2,
    points: 12,
    played: 6,
    won: 4,
    drawn: 0,
    lost: 2,
    goals_for: 10,
    goals_against: 6,
    goal_difference: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockMembers: Member[] = [
  {
    id: 1,
    name: "John Doe",
    number: 10,
    position: "Forward",
    role: "Captain",
    goals: 5,
    assists: 3,
    team_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team: mockTeams[0]
  },
  {
    id: 2,
    name: "Jane Smith",
    number: 7,
    position: "Midfielder",
    role: "Player",
    goals: 2,
    assists: 4,
    team_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team: mockTeams[0]
  }
];

const mockFixtures: Fixture[] = [
  {
    id: 1,
    home_team_id: 1,
    away_team_id: 2,
    match_date: "2024-01-15",
    match_time: "15:00",
    home_score: null,
    away_score: null,
    status: "scheduled",
    venue: "Main Stadium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_team: mockTeams[0],
    away_team: mockTeams[1]
  }
];

// Teams API
export const teamsApi = {
  getAll: async () => {
    if (!isSupabaseConfigured()) {
      console.log('Using mock data - Supabase not configured');
      return mockTeams;
    }

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
    if (!isSupabaseConfigured()) {
      const team = mockTeams.find(t => t.id === id);
      if (!team) throw new Error('Team not found');
      return team;
    }

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
    if (!isSupabaseConfigured()) {
      const teamIndex = mockTeams.findIndex(t => t.id === id);
      if (teamIndex === -1) throw new Error('Team not found');
      mockTeams[teamIndex] = { ...mockTeams[teamIndex], ...stats };
      return mockTeams[teamIndex];
    }

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
    if (!isSupabaseConfigured()) {
      console.log('Using mock data - Supabase not configured');
      return mockMembers;
    }

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
    if (!isSupabaseConfigured()) {
      return mockMembers.filter(m => m.team_id === teamId);
    }

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
    if (!isSupabaseConfigured()) {
      const memberIndex = mockMembers.findIndex(m => m.id === id);
      if (memberIndex === -1) throw new Error('Member not found');
      mockMembers[memberIndex] = { ...mockMembers[memberIndex], ...stats };
      return mockMembers[memberIndex];
    }

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
    if (!isSupabaseConfigured()) {
      console.log('Using mock data - Supabase not configured');
      return mockFixtures;
    }

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
    if (!isSupabaseConfigured()) {
      return mockFixtures.filter(f => f.status === 'scheduled');
    }

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
    if (!isSupabaseConfigured()) {
      return mockFixtures.filter(f => f.status === 'completed');
    }

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
    if (!isSupabaseConfigured()) {
      const fixtureIndex = mockFixtures.findIndex(f => f.id === id);
      if (fixtureIndex === -1) throw new Error('Fixture not found');
      mockFixtures[fixtureIndex] = {
        ...mockFixtures[fixtureIndex],
        home_score: homeScore,
        away_score: awayScore,
        status: 'completed'
      };
      return mockFixtures[fixtureIndex];
    }

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
    if (!isSupabaseConfigured()) {
      return [];
    }

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
    if (!isSupabaseConfigured()) {
      return {
        id: Date.now(),
        ...event,
        created_at: new Date().toISOString()
      } as MatchEvent;
    }

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
