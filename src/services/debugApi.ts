
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

      console.log('📊 DebugAPI: Raw data results:', {
        teamsCount: teams?.length || 0,
        membersCount: members?.length || 0,
        fixturesCount: fixtures?.length || 0,
        teamsError: !!teamsError,
        membersError: !!membersError,
        fixturesError: !!fixturesError
      });

      const debugData = {
        teams: {
          count: teams?.length || 0,
          data: teams || [],
          sample: teams?.[0] || null,
          error: teamsError?.message || null,
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
          error: membersError?.message || null,
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
          error: fixturesError?.message || null,
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
  },

  testDataConnectivity: async () => {
    console.log('🔗 DebugAPI: Testing data connectivity...');
    
    try {
      // Test basic connectivity to each table
      const connectivityTests = await Promise.all([
        supabase.from('teams').select('count', { count: 'exact', head: true }),
        supabase.from('members').select('count', { count: 'exact', head: true }),
        supabase.from('fixtures').select('count', { count: 'exact', head: true })
      ]);

      const results = {
        teams: {
          accessible: !connectivityTests[0].error,
          count: connectivityTests[0].count || 0,
          error: connectivityTests[0].error?.message || null
        },
        members: {
          accessible: !connectivityTests[1].error,
          count: connectivityTests[1].count || 0,
          error: connectivityTests[1].error?.message || null
        },
        fixtures: {
          accessible: !connectivityTests[2].error,
          count: connectivityTests[2].count || 0,
          error: connectivityTests[2].error?.message || null
        }
      };

      console.log('🔗 DebugAPI: Connectivity test results:', results);
      return results;
    } catch (error) {
      console.error('❌ DebugAPI: Connectivity test failed:', error);
      throw error;
    }
  }
};
