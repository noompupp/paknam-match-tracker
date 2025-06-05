import { supabase } from '@/integrations/supabase/client';

// Fetch match events with proper joins for team names
export const fetchMatchEvents = async (fixtureId: number) => {
  console.log('🔍 Fetching match events for fixture:', fixtureId);
  
  const { data: matchEvents, error } = await supabase
    .from('match_events')
    .select(`
      id,
      event_type,
      player_name,
      team_id,
      event_time,
      card_type,
      description,
      created_at
    `)
    .eq('fixture_id', fixtureId)
    .order('event_time', { ascending: true });

  if (error) {
    console.error('❌ Error fetching match events:', error);
    throw error;
  }

  // Enhance events with team names by fetching from teams table
  if (matchEvents && matchEvents.length > 0) {
    const teamIds = [...new Set(matchEvents.map(event => event.team_id))];
    
    const { data: teams } = await supabase
      .from('teams')
      .select('__id__, name')
      .in('__id__', teamIds);

    const teamMap = new Map(teams?.map(team => [team.__id__, team.name]) || []);

    return matchEvents.map(event => ({
      ...event,
      team_name: teamMap.get(event.team_id) || event.team_id,
      // Add assist fields as null since they don't exist in the database yet
      assist_player_name: null,
      assist_team_id: null
    }));
  }

  return matchEvents || [];
};

// Fetch player time tracking data
export const fetchPlayerTimeData = async (fixtureId: number) => {
  console.log('⏱️ Fetching player time data for fixture:', fixtureId);
  
  const { data: playerTimeData, error } = await supabase
    .from('player_time_tracking')
    .select('*')
    .eq('fixture_id', fixtureId);

  if (error) {
    console.error('❌ Error fetching player times:', error);
    throw error;
  }

  return playerTimeData;
};

// Fetch fixture details
export const fetchFixtureDetails = async (fixtureId: number) => {
  console.log('🏟️ Fetching fixture details for fixture:', fixtureId);
  
  const { data: fixture, error } = await supabase
    .from('fixtures')
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score
    `)
    .eq('id', fixtureId)
    .single();

  if (error) {
    console.error('❌ Error fetching fixture:', error);
    throw error;
  }

  return fixture;
};
