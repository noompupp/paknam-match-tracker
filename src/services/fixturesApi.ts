
import { supabase } from '@/integrations/supabase/client';
import { Fixture } from '@/types/database';

// Helper function to normalize IDs for consistent matching
const normalizeId = (id: any): string => {
  if (id === null || id === undefined) return '';
  return String(id).trim().toLowerCase();
};

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

const createTeamObject = (team: any) => ({
  id: team.id || 0,
  name: team.name || '',
  logo: team.logo || '⚽',
  logoURL: team.logoURL || undefined, // Include logoURL property
  color: team.color || undefined, // Include color property
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
});

export const fixturesApi = {
  getAll: async () => {
    console.log('🔍 FixturesAPI: Starting getAll request...');
    
    // First get all fixtures
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_date', { ascending: false });
    
    if (fixturesError) {
      console.error('❌ FixturesAPI: Error fetching fixtures:', fixturesError);
      throw fixturesError;
    }

    console.log('📊 FixturesAPI: Raw fixtures data from database:', {
      count: fixtures?.length || 0,
      sample: fixtures?.[0] || null,
      teamMappings: fixtures?.map(f => ({
        id: f.id,
        team1: f.team1,
        team2: f.team2,
        normalizedTeam1: normalizeId(f.team1),
        normalizedTeam2: normalizeId(f.team2)
      })) || []
    });

    if (!fixtures || fixtures.length === 0) {
      console.warn('⚠️ FixturesAPI: No fixtures found in database');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('❌ FixturesAPI: Error fetching teams for fixtures:', teamsError);
      throw teamsError;
    }

    console.log('📊 FixturesAPI: Teams data for joining:', {
      count: teams?.length || 0,
      idMappings: teams?.map(t => ({
        name: t.name,
        numericId: t.id,
        textId: t.__id__,
        normalized: normalizeId(t.__id__)
      })) || []
    });

    // Manually join fixtures with teams using normalized IDs
    const fixturesWithTeams = fixtures.map(fixture => {
      // Find home team using normalized team1 field
      const normalizedTeam1 = normalizeId(fixture.team1);
      const homeTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam1);
      
      // Find away team using normalized team2 field  
      const normalizedTeam2 = normalizeId(fixture.team2);
      const awayTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam2);

      console.log('🔄 FixturesAPI: Transforming fixture:', {
        fixtureId: fixture.id,
        team1: fixture.team1,
        team2: fixture.team2,
        normalizedTeam1,
        normalizedTeam2,
        foundHomeTeam: homeTeam ? { 
          id: homeTeam.id, 
          name: homeTeam.name,
          textId: homeTeam.__id__,
          normalized: normalizeId(homeTeam.__id__)
        } : null,
        foundAwayTeam: awayTeam ? { 
          id: awayTeam.id, 
          name: awayTeam.name,
          textId: awayTeam.__id__,
          normalized: normalizeId(awayTeam.__id__)
        } : null,
        availableTeams: teams?.map(t => ({
          name: t.name,
          textId: t.__id__,
          normalized: normalizeId(t.__id__)
        })) || []
      });

      return {
        ...fixture,
        home_team: homeTeam ? createTeamObject(homeTeam) : undefined,
        away_team: awayTeam ? createTeamObject(awayTeam) : undefined
      };
    });

    console.log('✅ FixturesAPI: Successfully transformed fixtures:', {
      count: fixturesWithTeams.length,
      fixturesWithBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length,
      fixturesWithoutTeams: fixturesWithTeams.filter(f => !f.home_team || !f.away_team).length
    });
    
    return fixturesWithTeams.map(transformFixture);
  },

  getUpcoming: async () => {
    console.log('🔍 FixturesAPI: Getting upcoming fixtures...');
    
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(5);
    
    if (fixturesError) {
      console.error('❌ FixturesAPI: Error fetching upcoming fixtures:', fixturesError);
      throw fixturesError;
    }

    console.log('📊 FixturesAPI: Upcoming fixtures data:', {
      count: fixtures?.length || 0,
      fixtures: fixtures || []
    });

    if (!fixtures || fixtures.length === 0) {
      console.warn('⚠️ FixturesAPI: No upcoming fixtures found');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('❌ FixturesAPI: Error fetching teams for upcoming fixtures:', teamsError);
      throw teamsError;
    }

    // Manually join fixtures with teams using normalized IDs
    const fixturesWithTeams = fixtures.map(fixture => {
      const normalizedTeam1 = normalizeId(fixture.team1);
      const normalizedTeam2 = normalizeId(fixture.team2);
      const homeTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam1);
      const awayTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam2);

      console.log('🔄 FixturesAPI: Processing upcoming fixture:', {
        fixtureId: fixture.id,
        foundHome: !!homeTeam,
        foundAway: !!awayTeam,
        homeTeamName: homeTeam?.name,
        awayTeamName: awayTeam?.name
      });

      return {
        ...fixture,
        home_team: homeTeam ? createTeamObject(homeTeam) : undefined,
        away_team: awayTeam ? createTeamObject(awayTeam) : undefined
      };
    });
    
    console.log('✅ FixturesAPI: Successfully processed upcoming fixtures:', {
      count: fixturesWithTeams.length,
      withBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length
    });
    
    return fixturesWithTeams.map(transformFixture);
  },

  getRecent: async () => {
    console.log('🔍 FixturesAPI: Getting recent fixtures...');
    
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'completed')
      .order('match_date', { ascending: false })
      .limit(5);
    
    if (fixturesError) {
      console.error('❌ FixturesAPI: Error fetching recent fixtures:', fixturesError);
      throw fixturesError;
    }

    console.log('📊 FixturesAPI: Recent fixtures data:', {
      count: fixtures?.length || 0,
      fixtures: fixtures || []
    });

    if (!fixtures || fixtures.length === 0) {
      console.warn('⚠️ FixturesAPI: No recent fixtures found');
      return [];
    }

    // Get all teams for manual joining
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error('❌ FixturesAPI: Error fetching teams for recent fixtures:', teamsError);
      throw teamsError;
    }

    // Manually join fixtures with teams using normalized IDs
    const fixturesWithTeams = fixtures.map(fixture => {
      const normalizedTeam1 = normalizeId(fixture.team1);
      const normalizedTeam2 = normalizeId(fixture.team2);
      const homeTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam1);
      const awayTeam = teams?.find(team => normalizeId(team.__id__) === normalizedTeam2);

      console.log('🔄 FixturesAPI: Processing recent fixture:', {
        fixtureId: fixture.id,
        foundHome: !!homeTeam,
        foundAway: !!awayTeam,
        homeTeamName: homeTeam?.name,
        awayTeamName: awayTeam?.name
      });

      return {
        ...fixture,
        home_team: homeTeam ? createTeamObject(homeTeam) : undefined,
        away_team: awayTeam ? createTeamObject(awayTeam) : undefined
      };
    });
    
    console.log('✅ FixturesAPI: Successfully processed recent fixtures:', {
      count: fixturesWithTeams.length,
      withBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length
    });
    
    return fixturesWithTeams.map(transformFixture);
  },

  updateScore: async (id: number, homeScore: number, awayScore: number) => {
    console.log('🔍 FixturesAPI: Updating fixture score:', { id, homeScore, awayScore });
    
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
      console.error('❌ FixturesAPI: Error updating fixture score:', error);
      throw error;
    }
    
    console.log('✅ FixturesAPI: Successfully updated fixture:', data);
    
    return {
      id: data.id || 0,
      home_team_id: 0,
      away_team_id: 0,
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
