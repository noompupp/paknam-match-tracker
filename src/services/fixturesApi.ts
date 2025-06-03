
import { supabase } from '@/integrations/supabase/client';
import { Fixture } from '@/types/database';

const transformFixture = (fixture: any): Fixture => ({
  id: fixture.id || 0,
  home_team_id: fixture.home_team?.id || 0,
  away_team_id: fixture.away_team?.id || 0,
  match_date: fixture.match_date || fixture.date?.toString() || '',
  match_time: fixture.match_time?.toString() || fixture.time?.toString() || '',
  home_score: fixture.home_score,
  away_score: fixture.away_score,
  status: (fixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'scheduled',
  venue: fixture.venue,
  created_at: fixture.created_at || new Date().toISOString(),
  updated_at: fixture.updated_at || new Date().toISOString(),
  home_team: fixture.home_team,
  away_team: fixture.away_team
});

export const fixturesApi = {
  getAll: async () => {
    // First get all fixtures
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_date', { ascending: false });
    
    if (fixturesError) {
      console.error('Error fetching fixtures:', fixturesError);
      throw fixturesError;
    }

    if (!fixtures || fixtures.length === 0) {
      console.log('No fixtures found in database');
      return [];
    }

    console.log('Raw fixtures data from database:', fixtures);

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('Error fetching teams for fixtures:', teamsError);
      throw teamsError;
    }

    console.log('Teams data for fixtures:', teams);

    // Manually join fixtures with teams
    const fixturesWithTeams = fixtures.map(fixture => {
      // Find home team using team1 field
      const homeTeam = teams?.find(team => team.__id__ === fixture.team1);
      // Find away team using team2 field  
      const awayTeam = teams?.find(team => team.__id__ === fixture.team2);

      return {
        ...fixture,
        home_team: homeTeam ? {
          id: homeTeam.id || 0,
          name: homeTeam.name || '',
          logo: homeTeam.logo || '⚽',
          founded: homeTeam.founded || '2020',
          captain: homeTeam.captain || '',
          position: homeTeam.position || 1,
          points: homeTeam.points || 0,
          played: homeTeam.played || 0,
          won: homeTeam.won || 0,
          drawn: homeTeam.drawn || 0,
          lost: homeTeam.lost || 0,
          goals_for: homeTeam.goals_for || 0,
          goals_against: homeTeam.goals_against || 0,
          goal_difference: homeTeam.goal_difference || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined,
        away_team: awayTeam ? {
          id: awayTeam.id || 0,
          name: awayTeam.name || '',
          logo: awayTeam.logo || '⚽',
          founded: awayTeam.founded || '2020',
          captain: awayTeam.captain || '',
          position: awayTeam.position || 1,
          points: awayTeam.points || 0,
          played: awayTeam.played || 0,
          won: awayTeam.won || 0,
          drawn: awayTeam.drawn || 0,
          lost: awayTeam.lost || 0,
          goals_for: awayTeam.goals_for || 0,
          goals_against: awayTeam.goals_against || 0,
          goal_difference: awayTeam.goal_difference || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined
      };
    });

    console.log('Fixtures with teams joined:', fixturesWithTeams);
    
    return fixturesWithTeams.map(transformFixture);
  },

  getUpcoming: async () => {
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(5);
    
    if (fixturesError) {
      console.error('Error fetching upcoming fixtures:', fixturesError);
      throw fixturesError;
    }

    if (!fixtures || fixtures.length === 0) {
      console.log('No upcoming fixtures found');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('Error fetching teams for upcoming fixtures:', teamsError);
      throw teamsError;
    }

    // Manually join fixtures with teams
    const fixturesWithTeams = fixtures.map(fixture => {
      const homeTeam = teams?.find(team => team.__id__ === fixture.team1);
      const awayTeam = teams?.find(team => team.__id__ === fixture.team2);

      return {
        ...fixture,
        home_team: homeTeam ? {
          id: homeTeam.id || 0,
          name: homeTeam.name || '',
          logo: homeTeam.logo || '⚽',
          founded: homeTeam.founded || '2020',
          captain: homeTeam.captain || '',
          position: homeTeam.position || 1,
          points: homeTeam.points || 0,
          played: homeTeam.played || 0,
          won: homeTeam.won || 0,
          drawn: homeTeam.drawn || 0,
          lost: homeTeam.lost || 0,
          goals_for: homeTeam.goals_for || 0,
          goals_against: homeTeam.goals_against || 0,
          goal_difference: homeTeam.goal_difference || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined,
        away_team: awayTeam ? {
          id: awayTeam.id || 0,
          name: awayTeam.name || '',
          logo: awayTeam.logo || '⚽',
          founded: awayTeam.founded || '2020',
          captain: awayTeam.captain || '',
          position: awayTeam.position || 1,
          points: awayTeam.points || 0,
          played: awayTeam.played || 0,
          won: awayTeam.won || 0,
          drawn: awayTeam.drawn || 0,
          lost: awayTeam.lost || 0,
          goals_for: awayTeam.goals_for || 0,
          goals_against: awayTeam.goals_against || 0,
          goal_difference: awayTeam.goal_difference || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined
      };
    });
    
    return fixturesWithTeams.map(transformFixture);
  },

  getRecent: async () => {
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'completed')
      .order('match_date', { ascending: false })
      .limit(5);
    
    if (fixturesError) {
      console.error('Error fetching recent fixtures:', fixturesError);
      throw fixturesError;
    }

    if (!fixtures || fixtures.length === 0) {
      console.log('No recent fixtures found');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('Error fetching teams for recent fixtures:', teamsError);
      throw teamsError;
    }

    // Manually join fixtures with teams
    const fixturesWithTeams = fixtures.map(fixture => {
      const homeTeam = teams?.find(team => team.__id__ === fixture.team1);
      const awayTeam = teams?.find(team => team.__id__ === fixture.team2);

      return {
        ...fixture,
        home_team: homeTeam ? {
          id: homeTeam.id || 0,
          name: homeTeam.name || '',
          logo: homeTeam.logo || '⚽',
          founded: homeTeam.founded || '2020',
          captain: homeTeam.captain || '',
          position: homeTeam.position || 1,
          points: homeTeam.points || 0,
          played: homeTeam.played || 0,
          won: homeTeam.won || 0,
          drawn: awayTeam.drawn || 0,
          lost: homeTeam.lost || 0,
          goals_for: homeTeam.goals_for || 0,
          goals_against: homeTeam.goals_against || 0,
          goal_difference: homeTeam.goal_difference || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined,
        away_team: awayTeam ? {
          id: awayTeam.id || 0,
          name: awayTeam.name || '',
          logo: awayTeam.logo || '⚽',
          founded: awayTeam.founded || '2020',
          captain: awayTeam.captain || '',
          position: awayTeam.position || 1,
          points: awayTeam.points || 0,
          played: awayTeam.played || 0,
          won: awayTeam.won || 0,
          drawn: awayTeam.drawn || 0,
          lost: awayTeam.lost || 0,
          goals_for: awayTeam.goals_for || 0,
          goals_against: awayTeam.goals_against || 0,
          goal_difference: awayTeam.goal_difference || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined
      };
    });
    
    return fixturesWithTeams.map(transformFixture);
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
      home_team_id: 0, // Will be properly set by transform
      away_team_id: 0, // Will be properly set by transform
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
