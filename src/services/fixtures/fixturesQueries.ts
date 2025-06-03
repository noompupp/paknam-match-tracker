
import { supabase } from '@/integrations/supabase/client';
import { transformFixture } from './utils';
import { joinFixturesWithTeams } from './teamUtils';

export const getAllFixtures = async () => {
  console.log('🔍 FixturesQueries: Starting getAll request...');
  
  // First get all fixtures
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*')
    .order('match_date', { ascending: false });
  
  if (fixturesError) {
    console.error('❌ FixturesQueries: Error fetching fixtures:', fixturesError);
    throw fixturesError;
  }

  console.log('📊 FixturesQueries: Raw fixtures data from database:', {
    count: fixtures?.length || 0,
    sample: fixtures?.[0] || null,
    teamMappings: fixtures?.map(f => ({
      id: f.id,
      team1: f.team1,
      team2: f.team2
    })) || []
  });

  if (!fixtures || fixtures.length === 0) {
    console.warn('⚠️ FixturesQueries: No fixtures found in database');
    return [];
  }

  // Get all teams for manual joining
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*');
  
  if (teamsError) {
    console.error('❌ FixturesQueries: Error fetching teams for fixtures:', teamsError);
    throw teamsError;
  }

  console.log('📊 FixturesQueries: Teams data for joining:', {
    count: teams?.length || 0,
    idMappings: teams?.map(t => ({
      name: t.name,
      numericId: t.id,
      textId: t.__id__,
      logoURL: t.logoURL,
      hasLogoURL: !!t.logoURL
    })) || []
  });

  // Manually join fixtures with teams using normalized IDs
  const fixturesWithTeams = joinFixturesWithTeams(fixtures, teams || []);

  console.log('✅ FixturesQueries: Successfully transformed fixtures:', {
    count: fixturesWithTeams.length,
    fixturesWithBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length,
    fixturesWithoutTeams: fixturesWithTeams.filter(f => !f.home_team || !f.away_team).length,
    teamsWithLogos: fixturesWithTeams.filter(f => f.home_team?.logoURL || f.away_team?.logoURL).length
  });
  
  return fixturesWithTeams.map(transformFixture);
};

export const getUpcomingFixtures = async () => {
  console.log('🔍 FixturesQueries: Getting upcoming fixtures...');
  
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*')
    .eq('status', 'scheduled')
    .order('match_date', { ascending: true })
    .limit(5);
  
  if (fixturesError) {
    console.error('❌ FixturesQueries: Error fetching upcoming fixtures:', fixturesError);
    throw fixturesError;
  }

  console.log('📊 FixturesQueries: Upcoming fixtures data:', {
    count: fixtures?.length || 0,
    fixtures: fixtures || []
  });

  if (!fixtures || fixtures.length === 0) {
    console.warn('⚠️ FixturesQueries: No upcoming fixtures found');
    return [];
  }

  // Get all teams for manual joining
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*');
  
  if (teamsError) {
    console.error('❌ FixturesQueries: Error fetching teams for upcoming fixtures:', teamsError);
    throw teamsError;
  }

  // Manually join fixtures with teams using normalized IDs
  const fixturesWithTeams = joinFixturesWithTeams(fixtures, teams || []);
  
  console.log('✅ FixturesQueries: Successfully processed upcoming fixtures:', {
    count: fixturesWithTeams.length,
    withBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length
  });
  
  return fixturesWithTeams.map(transformFixture);
};

export const getRecentFixtures = async () => {
  console.log('🔍 FixturesQueries: Getting recent fixtures...');
  
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*')
    .eq('status', 'completed')
    .order('match_date', { ascending: false })
    .limit(5);
  
  if (fixturesError) {
    console.error('❌ FixturesQueries: Error fetching recent fixtures:', fixturesError);
    throw fixturesError;
  }

  console.log('📊 FixturesQueries: Recent fixtures data:', {
    count: fixtures?.length || 0,
    fixtures: fixtures || []
  });

  if (!fixtures || fixtures.length === 0) {
    console.warn('⚠️ FixturesQueries: No recent fixtures found');
    return [];
  }

  // Get all teams for manual joining
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*');
  
  if (teamsError) {
    console.error('❌ FixturesQueries: Error fetching teams for recent fixtures:', teamsError);
    throw teamsError;
  }

  // Manually join fixtures with teams using normalized IDs
  const fixturesWithTeams = joinFixturesWithTeams(fixtures, teams || []);
  
  console.log('✅ FixturesQueries: Successfully processed recent fixtures:', {
    count: fixturesWithTeams.length,
    withBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length
  });
  
  return fixturesWithTeams.map(transformFixture);
};
