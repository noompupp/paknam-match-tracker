
import { supabase } from '@/integrations/supabase/client';
import { transformFixture } from './utils';
import { joinFixturesWithTeams } from './teamUtils';

export const getAllFixtures = async () => {
  console.log('🔍 FixturesQueries: Starting getAll request...');
  
  // Get all fixtures with better sorting (completed matches by date desc, scheduled by date asc)
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*')
    .order('status', { ascending: false }) // completed first
    .order('match_date', { ascending: false }) // then by date
    .order('time', { ascending: true }); // then by time
  
  if (fixturesError) {
    console.error('❌ FixturesQueries: Error fetching fixtures:', fixturesError);
    throw fixturesError;
  }

  console.log('📊 FixturesQueries: Raw fixtures data from database:', {
    count: fixtures?.length || 0,
    sample: fixtures?.[0] || null,
    timeVariety: [...new Set(fixtures?.map(f => f.time))],
    statusBreakdown: fixtures?.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
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
    teamsWithLogos: fixturesWithTeams.filter(f => f.home_team?.logoURL || f.away_team?.logoURL).length,
    timeDistribution: fixturesWithTeams.reduce((acc, f) => {
      const time = f.time || 'null';
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });
  
  return fixturesWithTeams.map(transformFixture);
};

export const getUpcomingFixtures = async () => {
  console.log('🔍 FixturesQueries: Getting upcoming fixtures...');
  
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Get upcoming fixtures by date and time, sorted chronologically
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*')
    .eq('status', 'scheduled')
    .gte('match_date', currentDate) // Only matches today or in the future
    .order('match_date', { ascending: true })
    .order('time', { ascending: true }) // Sort by time within each date
    .limit(3); // Only get the next 3 fixtures
  
  if (fixturesError) {
    console.error('❌ FixturesQueries: Error fetching upcoming fixtures:', fixturesError);
    throw fixturesError;
  }

  console.log('📊 FixturesQueries: Upcoming fixtures data:', {
    count: fixtures?.length || 0,
    fixtures: fixtures?.map(f => ({
      id: f.id,
      date: f.match_date,
      time: f.time,
      status: f.status
    })) || []
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
    withBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length,
    timesFound: fixturesWithTeams.map(f => f.time)
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
    .order('time', { ascending: false })
    .limit(5);
  
  if (fixturesError) {
    console.error('❌ FixturesQueries: Error fetching recent fixtures:', fixturesError);
    throw fixturesError;
  }

  console.log('📊 FixturesQueries: Recent fixtures data:', {
    count: fixtures?.length || 0,
    fixtures: fixtures?.map(f => ({
      id: f.id,
      date: f.match_date,
      time: f.time,
      homeScore: f.home_score,
      awayScore: f.away_score
    })) || []
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
    withBothTeams: fixturesWithTeams.filter(f => f.home_team && f.away_team).length,
    resultsFound: fixturesWithTeams.map(f => `${f.home_score}-${f.away_score}`)
  });
  
  return fixturesWithTeams.map(transformFixture);
};
