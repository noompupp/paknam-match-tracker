
import { supabase } from '@/integrations/supabase/client';
import { resolveTeamIdForMatchEvent } from '@/utils/teamIdMapping';

export class DataIntegrityValidator {
  async validateDatabaseConsistency(): Promise<any> {
    console.log('🔍 DataIntegrityValidator: Checking database consistency...');
    
    try {
      const issues: string[] = [];
      const warnings: string[] = [];

      // Check fixtures table
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select('id, home_team_id, away_team_id, home_score, away_score');

      if (fixturesError) {
        issues.push(`Fixtures query failed: ${fixturesError.message}`);
      } else {
        // Check for fixtures with invalid team IDs
        const invalidFixtures = fixtures?.filter(f => !f.home_team_id || !f.away_team_id);
        if (invalidFixtures && invalidFixtures.length > 0) {
          warnings.push(`Found ${invalidFixtures.length} fixtures with missing team IDs`);
        }

        // Check for fixtures with negative scores
        const negativeScores = fixtures?.filter(f => 
          (f.home_score !== null && f.home_score < 0) || 
          (f.away_score !== null && f.away_score < 0)
        );
        if (negativeScores && negativeScores.length > 0) {
          issues.push(`Found ${negativeScores.length} fixtures with negative scores`);
        }
      }

      // Check teams table
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, __id__, name');

      if (teamsError) {
        issues.push(`Teams query failed: ${teamsError.message}`);
      } else {
        // Check for teams without names
        const unnamedTeams = teams?.filter(t => !t.name || t.name.trim() === '');
        if (unnamedTeams && unnamedTeams.length > 0) {
          warnings.push(`Found ${unnamedTeams.length} teams without names`);
        }

        // Check for teams without __id__
        const missingIds = teams?.filter(t => !t.__id__);
        if (missingIds && missingIds.length > 0) {
          issues.push(`Found ${missingIds.length} teams without __id__`);
        }
      }

      // Check members table
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, name, team_id, goals, assists');

      if (membersError) {
        issues.push(`Members query failed: ${membersError.message}`);
      } else {
        // Check for members without names
        const unnamedMembers = members?.filter(m => !m.name || m.name.trim() === '');
        if (unnamedMembers && unnamedMembers.length > 0) {
          warnings.push(`Found ${unnamedMembers.length} members without names`);
        }

        // Check for negative stats
        const negativeStats = members?.filter(m => 
          (m.goals !== null && m.goals < 0) || 
          (m.assists !== null && m.assists < 0)
        );
        if (negativeStats && negativeStats.length > 0) {
          issues.push(`Found ${negativeStats.length} members with negative stats`);
        }
      }

      if (issues.length > 0) {
        throw new Error(`Database consistency issues found: ${issues.join(', ')}`);
      }

      return {
        success: true,
        message: `Database consistency check passed${warnings.length > 0 ? ' with warnings' : ''}`,
        warnings,
        details: {
          fixtures: fixtures?.length || 0,
          teams: teams?.length || 0,
          members: members?.length || 0
        }
      };
    } catch (error) {
      throw new Error(`Database consistency validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateTeamIdMapping(): Promise<any> {
    console.log('🔍 DataIntegrityValidator: Testing team ID mapping...');
    
    try {
      // Test team ID resolution
      const testCases = [
        {
          playerTeam: 'Test Home Team',
          homeTeam: { id: '1', name: 'Test Home Team', __id__: '1' },
          awayTeam: { id: '2', name: 'Test Away Team', __id__: '2' }
        },
        {
          playerTeam: 'Test Away Team',
          homeTeam: { id: '1', name: 'Test Home Team', __id__: '1' },
          awayTeam: { id: '2', name: 'Test Away Team', __id__: '2' }
        }
      ];

      const results = [];

      for (const testCase of testCases) {
        try {
          const resolvedId = resolveTeamIdForMatchEvent(
            testCase.playerTeam,
            testCase.homeTeam,
            testCase.awayTeam
          );

          const expectedId = testCase.playerTeam === testCase.homeTeam.name 
            ? testCase.homeTeam.__id__ 
            : testCase.awayTeam.__id__;

          if (resolvedId === expectedId) {
            results.push({ test: testCase.playerTeam, status: 'passed', resolvedId });
          } else {
            results.push({ 
              test: testCase.playerTeam, 
              status: 'failed', 
              resolvedId, 
              expectedId 
            });
          }
        } catch (error) {
          results.push({ 
            test: testCase.playerTeam, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      const failedTests = results.filter(r => r.status !== 'passed');
      
      if (failedTests.length > 0) {
        throw new Error(`Team ID mapping failed for ${failedTests.length} test cases`);
      }

      return {
        success: true,
        message: 'Team ID mapping validation passed',
        details: results
      };
    } catch (error) {
      throw new Error(`Team ID mapping validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validatePlayerStatsSync(): Promise<any> {
    console.log('🔍 DataIntegrityValidator: Checking player stats synchronization...');
    
    try {
      // Get sample of players
      const { data: players, error: playersError } = await supabase
        .from('members')
        .select('id, name, goals, assists')
        .limit(10);

      if (playersError) {
        throw new Error(`Failed to fetch players: ${playersError.message}`);
      }

      if (!players || players.length === 0) {
        return {
          success: true,
          message: 'No players found to validate stats synchronization',
          details: { playersChecked: 0 }
        };
      }

      const inconsistencies = [];

      for (const player of players) {
        // Check match events for this player
        const { data: events, error: eventsError } = await supabase
          .from('match_events')
          .select('event_type')
          .eq('player_name', player.name);

        if (eventsError) {
          console.warn(`Failed to fetch events for ${player.name}:`, eventsError);
          continue;
        }

        if (events) {
          const goalsFromEvents = events.filter(e => e.event_type === 'goal').length;
          const assistsFromEvents = events.filter(e => e.event_type === 'assist').length;

          const playerGoals = player.goals || 0;
          const playerAssists = player.assists || 0;

          if (goalsFromEvents !== playerGoals || assistsFromEvents !== playerAssists) {
            inconsistencies.push({
              player: player.name,
              playerStats: { goals: playerGoals, assists: playerAssists },
              eventStats: { goals: goalsFromEvents, assists: assistsFromEvents }
            });
          }
        }
      }

      if (inconsistencies.length > 0) {
        return {
          success: true,
          message: `Player stats sync check completed with ${inconsistencies.length} inconsistencies`,
          warnings: [`Found ${inconsistencies.length} players with mismatched stats`],
          details: { inconsistencies, playersChecked: players.length }
        };
      }

      return {
        success: true,
        message: 'Player stats synchronization validation passed',
        details: { playersChecked: players.length, inconsistencies: 0 }
      };
    } catch (error) {
      throw new Error(`Player stats sync validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateDuplicatePrevention(): Promise<any> {
    console.log('🔍 DataIntegrityValidator: Checking duplicate prevention...');
    
    try {
      // Check for duplicate match events
      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('fixture_id, player_name, event_type, event_time, team_id');

      if (eventsError) {
        throw new Error(`Failed to fetch match events: ${eventsError.message}`);
      }

      if (!events || events.length === 0) {
        return {
          success: true,
          message: 'No match events found to check for duplicates',
          details: { eventsChecked: 0 }
        };
      }

      // Group events by fixture, player, type, and time
      const eventGroups = new Map<string, any[]>();
      
      events.forEach(event => {
        const key = `${event.fixture_id}-${event.player_name}-${event.event_type}-${event.event_time}-${event.team_id}`;
        if (!eventGroups.has(key)) {
          eventGroups.set(key, []);
        }
        eventGroups.get(key)!.push(event);
      });

      // Find duplicates
      const duplicates = [];
      for (const [key, eventGroup] of eventGroups) {
        if (eventGroup.length > 1) {
          duplicates.push({
            key,
            count: eventGroup.length,
            events: eventGroup
          });
        }
      }

      if (duplicates.length > 0) {
        return {
          success: true,
          message: `Duplicate prevention check completed with ${duplicates.length} duplicate groups found`,
          warnings: [`Found ${duplicates.length} groups of duplicate events`],
          details: { duplicates, totalEvents: events.length }
        };
      }

      return {
        success: true,
        message: 'Duplicate prevention validation passed - no duplicates found',
        details: { eventsChecked: events.length, duplicatesFound: 0 }
      };
    } catch (error) {
      throw new Error(`Duplicate prevention validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateMatchEventsIntegrity(): Promise<any> {
    console.log('🔍 DataIntegrityValidator: Checking match events integrity...');
    
    try {
      const issues: string[] = [];
      const warnings: string[] = [];

      // Check match events
      const { data: events, error: eventsError } = await supabase
        .from('match_events')
        .select('*');

      if (eventsError) {
        throw new Error(`Failed to fetch match events: ${eventsError.message}`);
      }

      if (!events || events.length === 0) {
        return {
          success: true,
          message: 'No match events found to validate',
          details: { eventsChecked: 0 }
        };
      }

      // Check for events with missing required fields
      const incompleteEvents = events.filter(e => 
        !e.fixture_id || !e.player_name || !e.event_type || !e.team_id
      );
      
      if (incompleteEvents.length > 0) {
        issues.push(`Found ${incompleteEvents.length} events with missing required fields`);
      }

      // Check for events with invalid event types
      const validEventTypes = ['goal', 'assist', 'yellow', 'red', 'other'];
      const invalidEventTypes = events.filter(e => 
        !validEventTypes.includes(e.event_type)
      );
      
      if (invalidEventTypes.length > 0) {
        warnings.push(`Found ${invalidEventTypes.length} events with invalid event types`);
      }

      // Check for events with negative event times
      const negativeTimeEvents = events.filter(e => e.event_time < 0);
      
      if (negativeTimeEvents.length > 0) {
        issues.push(`Found ${negativeTimeEvents.length} events with negative event times`);
      }

      // Check for events with unrealistic event times (more than 120 minutes)
      const unrealisticTimeEvents = events.filter(e => e.event_time > 7200); // 120 minutes in seconds
      
      if (unrealisticTimeEvents.length > 0) {
        warnings.push(`Found ${unrealisticTimeEvents.length} events with unrealistic event times (>120 minutes)`);
      }

      if (issues.length > 0) {
        throw new Error(`Match events integrity issues found: ${issues.join(', ')}`);
      }

      return {
        success: true,
        message: `Match events integrity check passed${warnings.length > 0 ? ' with warnings' : ''}`,
        warnings,
        details: {
          eventsChecked: events.length,
          incompleteEvents: incompleteEvents.length,
          invalidEventTypes: invalidEventTypes.length,
          negativeTimeEvents: negativeTimeEvents.length,
          unrealisticTimeEvents: unrealisticTimeEvents.length
        }
      };
    } catch (error) {
      throw new Error(`Match events integrity validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
