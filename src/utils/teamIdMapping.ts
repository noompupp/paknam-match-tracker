
import { supabase } from '@/integrations/supabase/client';

interface TeamIdMapping {
  stringId: string;
  numericId: number;
  teamName: string;
}

let teamMappingCache: TeamIdMapping[] | null = null;

export const getTeamIdMapping = async (): Promise<TeamIdMapping[]> => {
  console.log('🔄 TeamIdMapping: Getting team ID mapping...');
  
  if (teamMappingCache) {
    console.log('✅ TeamIdMapping: Using cached mapping:', teamMappingCache);
    return teamMappingCache;
  }

  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select('id, __id__, name');

    if (error) {
      console.error('❌ TeamIdMapping: Error fetching teams:', error);
      throw error;
    }

    teamMappingCache = (teams || []).map(team => ({
      stringId: team.__id__,
      numericId: team.id,
      teamName: team.name
    }));

    console.log('✅ TeamIdMapping: Created mapping cache:', teamMappingCache);
    return teamMappingCache;
  } catch (error) {
    console.error('❌ TeamIdMapping: Failed to create mapping:', error);
    throw error;
  }
};

export const getNumericTeamId = async (stringTeamId: string): Promise<number> => {
  console.log('🔍 TeamIdMapping: Converting string ID to numeric:', stringTeamId);
  
  const mapping = await getTeamIdMapping();
  const team = mapping.find(t => t.stringId === stringTeamId);
  
  if (!team) {
    throw new Error(`Team with string ID ${stringTeamId} not found in mapping`);
  }
  
  console.log(`✅ TeamIdMapping: ${stringTeamId} → ${team.numericId} (${team.teamName})`);
  return team.numericId;
};

export const getStringTeamId = async (numericTeamId: number): Promise<string> => {
  console.log('🔍 TeamIdMapping: Converting numeric ID to string:', numericTeamId);
  
  const mapping = await getTeamIdMapping();
  const team = mapping.find(t => t.numericId === numericTeamId);
  
  if (!team) {
    throw new Error(`Team with numeric ID ${numericTeamId} not found in mapping`);
  }
  
  console.log(`✅ TeamIdMapping: ${numericTeamId} → ${team.stringId} (${team.teamName})`);
  return team.stringId;
};

export const clearTeamMappingCache = (): void => {
  console.log('🗑️ TeamIdMapping: Clearing cache');
  teamMappingCache = null;
};
