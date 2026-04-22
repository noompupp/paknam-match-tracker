
import { supabase } from '@/integrations/supabase/client';
import { getCurrentSeasonId } from '@/lib/seasonStore';

export const fetchAllTeams = async () => {
  const seasonId = getCurrentSeasonId();
  let q = supabase
    .from('teams')
    .select('*');
  if (seasonId) q = q.eq('season_id', seasonId);
  const { data: teams, error: teamsError } = await q;
  
  if (teamsError) {
    console.error('❌ TeamQueries: Error fetching teams for members:', teamsError);
    throw teamsError;
  }

  console.log('📊 TeamQueries: Teams data for joining:', {
    count: teams?.length || 0,
    sample: teams?.[0] || null
  });
  
  return teams || [];
};

export const fetchTeamByNumericId = async (teamId: number) => {
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('__id__, name, *')
    .eq('id', teamId)
    .single();
  
  if (teamError || !team) {
    console.warn('⚠️ TeamQueries: No team found for id:', teamId, teamError);
    return null;
  }

  console.log('✅ TeamQueries: Found team:', {
    numericId: teamId,
    textId: team.__id__,
    name: team.name
  });
  
  return team;
};
