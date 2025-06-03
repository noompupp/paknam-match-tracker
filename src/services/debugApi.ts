
import { supabase } from '@/integrations/supabase/client';

export const debugApi = {
  getAllRawData: async () => {
    console.log('🔍 DebugAPI: Starting comprehensive data fetch...');
    
    try {
      // Get raw teams data
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('position', { ascending: true });
      
      if (teamsError) {
        console.error('❌ DebugAPI: Teams error:', teamsError);
      }

      // Get raw members data
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });
      
      if (membersError) {
        console.error('❌ DebugAPI: Members error:', membersError);
      }

      // Get raw fixtures data
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select('*')
        .order('match_date', { ascending: false });
      
      if (fixturesError) {
        console.error('❌ DebugAPI: Fixtures error:', fixturesError);
      }

      const debugData = {
        teams: {
          count: teams?.length || 0,
          data: teams || [],
          sample: teams?.[0] || null,
          idTypes: teams?.map(t => ({
            id: t.id,
            idType: typeof t.id,
            __id__: t.__id__,
            __id__Type: typeof t.__id__,
            name: t.name
          })) || []
        },
        members: {
          count: members?.length || 0,
          data: members || [],
          sample: members?.[0] || null,
          teamIdMappings: members?.map(m => ({
            name: m.name,
            team_id: m.team_id,
            team_idType: typeof m.team_id
          })) || []
        },
        fixtures: {
          count: fixtures?.length || 0,
          data: fixtures || [],
          sample: fixtures?.[0] || null,
          teamMappings: fixtures?.map(f => ({
            id: f.id,
            team1: f.team1,
            team2: f.team2,
            team1Type: typeof f.team1,
            team2Type: typeof f.team2
          })) || []
        }
      };

      console.log('📊 DebugAPI: Complete data structure:', debugData);
      
      return debugData;
    } catch (error) {
      console.error('❌ DebugAPI: Unexpected error:', error);
      throw error;
    }
  },

  testIdNormalization: async () => {
    console.log('🧪 DebugAPI: Testing ID normalization...');
    
    // Test the normalize function
    const testValues = [
      1, '1', 'team1', 'team_001', null, undefined, 0, '0'
    ];
    
    const normalizeId = (id: any): string => {
      if (id === null || id === undefined) return '';
      return String(id).trim().toLowerCase();
    };

    const results = testValues.map(value => ({
      original: value,
      originalType: typeof value,
      normalized: normalizeId(value),
      normalizedType: typeof normalizeId(value)
    }));

    console.log('🧪 DebugAPI: Normalization test results:', results);
    return results;
  }
};
