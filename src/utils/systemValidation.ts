
import { supabase } from '@/integrations/supabase/client';

interface SystemValidationResult {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
  systemMetrics: {
    teamsCount: number;
    membersCount: number;
    fixturesCount: number;
    matchEventsCount: number;
  };
}

export const runSystemValidation = async (): Promise<SystemValidationResult> => {
  console.log('🔍 SystemValidation: Starting comprehensive system validation...');
  
  const result: SystemValidationResult = {
    isHealthy: true,
    issues: [],
    recommendations: [],
    systemMetrics: {
      teamsCount: 0,
      membersCount: 0,
      fixturesCount: 0,
      matchEventsCount: 0
    }
  };

  try {
    // Test 1: Validate teams data
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      result.issues.push(`Teams data error: ${teamsError.message}`);
      result.isHealthy = false;
    } else {
      result.systemMetrics.teamsCount = teams?.length || 0;
      if (result.systemMetrics.teamsCount === 0) {
        result.issues.push('No teams found in the system');
        result.recommendations.push('Add teams to enable full functionality');
        result.isHealthy = false;
      }
    }

    // Test 2: Validate members data
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*, team:teams(name)');

    if (membersError) {
      result.issues.push(`Members data error: ${membersError.message}`);
      result.isHealthy = false;
    } else {
      result.systemMetrics.membersCount = members?.length || 0;
      if (result.systemMetrics.membersCount === 0) {
        result.issues.push('No members found in the system');
        result.recommendations.push('Add players to teams');
        result.isHealthy = false;
      }

      // Check for members without teams
      const membersWithoutTeams = members?.filter(m => !m.team) || [];
      if (membersWithoutTeams.length > 0) {
        result.issues.push(`${membersWithoutTeams.length} members are not assigned to teams`);
        result.recommendations.push('Assign all members to teams for proper functionality');
      }
    }

    // Test 3: Validate fixtures data
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*');

    if (fixturesError) {
      result.issues.push(`Fixtures data error: ${fixturesError.message}`);
      result.isHealthy = false;
    } else {
      result.systemMetrics.fixturesCount = fixtures?.length || 0;
      if (result.systemMetrics.fixturesCount === 0) {
        result.recommendations.push('Add fixtures to schedule matches');
      }
    }

    // Test 4: Validate match events data
    const { data: matchEvents, error: eventsError } = await supabase
      .from('match_events')
      .select('*');

    if (eventsError) {
      result.issues.push(`Match events data error: ${eventsError.message}`);
      result.isHealthy = false;
    } else {
      result.systemMetrics.matchEventsCount = matchEvents?.length || 0;
    }

    // Test 5: Validate data consistency
    if (teams && members && fixtures) {
      // Check for orphaned members
      const teamIds = teams.map(t => t.id);
      const orphanedMembers = members.filter(m => m.team_id && !teamIds.includes(m.team_id));
      if (orphanedMembers.length > 0) {
        result.issues.push(`${orphanedMembers.length} members reference non-existent teams`);
        result.recommendations.push('Clean up member-team relationships');
      }
    }

    // Test 6: Performance check
    const startTime = Date.now();
    await supabase.from('teams').select('count', { count: 'exact', head: true });
    const queryTime = Date.now() - startTime;
    
    if (queryTime > 2000) {
      result.issues.push('Database queries are running slowly');
      result.recommendations.push('Consider database optimization');
    }

    console.log('✅ SystemValidation: Validation completed:', result);
    return result;

  } catch (error) {
    console.error('❌ SystemValidation: Critical error during validation:', error);
    result.issues.push(`System validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.isHealthy = false;
    return result;
  }
};

export const validatePlayerStats = async (): Promise<{ isValid: boolean; issues: string[] }> => {
  console.log('🔍 SystemValidation: Validating player statistics consistency...');
  
  try {
    // Get all members with their current stats
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, name, goals, assists');

    if (membersError) throw membersError;

    // Get all match events
    const { data: matchEvents, error: eventsError } = await supabase
      .from('match_events')
      .select('*')
      .neq('player_name', 'Unknown Player')
      .in('event_type', ['goal', 'assist']);

    if (eventsError) throw eventsError;

    if (!members || !matchEvents) {
      return { isValid: true, issues: [] };
    }

    // Calculate expected stats from match events
    const expectedStats = new Map<string, { goals: number; assists: number }>();

    for (const event of matchEvents) {
      const playerName = event.player_name;
      
      if (!expectedStats.has(playerName)) {
        expectedStats.set(playerName, { goals: 0, assists: 0 });
      }

      const stats = expectedStats.get(playerName)!;
      
      if (event.event_type === 'goal') {
        stats.goals += 1;
      } else if (event.event_type === 'assist') {
        stats.assists += 1;
      }
    }

    // Compare with actual member stats
    const issues: string[] = [];
    for (const member of members) {
      const expected = expectedStats.get(member.name) || { goals: 0, assists: 0 };
      const actual = { goals: member.goals || 0, assists: member.assists || 0 };

      if (expected.goals !== actual.goals) {
        issues.push(`${member.name}: Expected ${expected.goals} goals, has ${actual.goals}`);
      }

      if (expected.assists !== actual.assists) {
        issues.push(`${member.name}: Expected ${expected.assists} assists, has ${actual.assists}`);
      }
    }

    const isValid = issues.length === 0;
    console.log(`🔍 SystemValidation: Stats validation ${isValid ? 'passed' : 'failed'}:`, issues);

    return { isValid, issues };

  } catch (error) {
    console.error('❌ SystemValidation: Error during stats validation:', error);
    return { 
      isValid: false, 
      issues: [`Stats validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
};
