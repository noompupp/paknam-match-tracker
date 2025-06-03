
import { supabase } from '@/integrations/supabase/client';
import { Fixture } from '@/types/database';

interface SimpleTeam {
  id: number;
  name: string;
  played: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
}

export interface FixtureData {
  fixture: any;
  homeTeam: SimpleTeam;
  awayTeam: SimpleTeam;
}

export const fetchFixtureWithTeams = async (id: number): Promise<FixtureData> => {
  console.log('🔍 FixtureDataService: Fetching fixture with teams:', { id });
  
  // First, get the current fixture to access team information
  const { data: currentFixture, error: fetchError } = await supabase
    .from('fixtures')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('❌ FixtureDataService: Error fetching current fixture:', fetchError);
    throw fetchError;
  }

  console.log('📊 FixtureDataService: Current fixture data:', currentFixture);

  // Get teams using the consistent team ID approach
  const homeTeamId = currentFixture.team1;
  const awayTeamId = currentFixture.team2;

  console.log('🔍 FixtureDataService: Team IDs found:', { homeTeamId, awayTeamId });

  // Find home team
  const homeTeam = await fetchTeamById(homeTeamId, 'home');
  
  // Find away team
  const awayTeam = await fetchTeamById(awayTeamId, 'away');

  return {
    fixture: currentFixture,
    homeTeam,
    awayTeam
  };
};

const fetchTeamById = async (teamId: string, teamType: 'home' | 'away'): Promise<SimpleTeam> => {
  if (!teamId) {
    throw new Error(`${teamType === 'home' ? 'Home' : 'Away'} team ID is missing from fixture`);
  }

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, name, played, points, won, drawn, lost, goals_for, goals_against, goal_difference')
    .eq('__id__', teamId)
    .maybeSingle();
  
  if (teamError) {
    console.error(`❌ FixtureDataService: Error fetching ${teamType} team:`, teamError);
    throw new Error(`Failed to fetch ${teamType} team: ${teamError.message}`);
  }
  
  if (!team) {
    console.error(`❌ FixtureDataService: ${teamType === 'home' ? 'Home' : 'Away'} team not found for ID:`, teamId);
    throw new Error(`${teamType === 'home' ? 'Home' : 'Away'} team not found for ID: ${teamId}`);
  }

  console.log(`✅ FixtureDataService: Found ${teamType} team:`, team.name);
  return team;
};

export const updateFixtureInDatabase = async (id: number, homeScore: number, awayScore: number) => {
  console.log('💾 FixtureDataService: Updating fixture in database:', { id, homeScore, awayScore });
  
  const { data: updatedFixture, error: fixtureError } = await supabase
    .from('fixtures')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (fixtureError) {
    console.error('❌ FixtureDataService: Error updating fixture:', fixtureError);
    throw new Error(`Failed to update fixture: ${fixtureError.message}`);
  }

  console.log('✅ FixtureDataService: Fixture updated successfully:', updatedFixture);
  return updatedFixture;
};

export const createFixtureResult = (updatedFixture: any, homeTeam: SimpleTeam, awayTeam: SimpleTeam): Fixture => {
  return {
    id: updatedFixture.id || 0,
    home_team_id: homeTeam?.id || 0,
    away_team_id: awayTeam?.id || 0,
    home_team: homeTeam ? {
      id: homeTeam.id,
      name: homeTeam.name,
      logo: '⚽',
      logoURL: '',
      founded: '2020',
      captain: '',
      position: 1,
      points: homeTeam.points,
      played: homeTeam.played,
      won: homeTeam.won,
      drawn: homeTeam.drawn,
      lost: homeTeam.lost,
      goals_for: homeTeam.goals_for,
      goals_against: homeTeam.goals_against,
      goal_difference: homeTeam.goal_difference,
      color: '',
      created_at: '',
      updated_at: ''
    } : undefined,
    away_team: awayTeam ? {
      id: awayTeam.id,
      name: awayTeam.name,
      logo: '⚽',
      logoURL: '',
      founded: '2020',
      captain: '',
      position: 1,
      points: awayTeam.points,
      played: awayTeam.played,
      won: awayTeam.won,
      drawn: awayTeam.drawn,
      lost: awayTeam.lost,
      goals_for: awayTeam.goals_for,
      goals_against: awayTeam.goals_against,
      goal_difference: awayTeam.goal_difference,
      color: '',
      created_at: '',
      updated_at: ''
    } : undefined,
    match_date: updatedFixture.match_date || updatedFixture.date?.toString() || '',
    match_time: updatedFixture.match_time?.toString() || updatedFixture.time?.toString() || '',
    home_score: updatedFixture.home_score,
    away_score: updatedFixture.away_score,
    status: (updatedFixture.status as 'scheduled' | 'live' | 'completed' | 'postponed') || 'completed',
    venue: updatedFixture.venue,
    created_at: updatedFixture.created_at || new Date().toISOString(),
    updated_at: updatedFixture.updated_at || new Date().toISOString()
  };
};
