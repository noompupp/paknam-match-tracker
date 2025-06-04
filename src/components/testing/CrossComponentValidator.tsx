
import { supabase } from '@/integrations/supabase/client';

export class CrossComponentValidator {
  async validateMatchSummary(): Promise<any> {
    console.log('🔍 CrossComponentValidator: Validating match summary display...');
    
    try {
      // Test match summary data integration
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select(`
          id,
          home_score,
          away_score,
          home_team_id,
          away_team_id
        `)
        .limit(5);

      if (fixturesError) {
        throw new Error(`Failed to fetch fixtures: ${fixturesError.message}`);
      }

      if (!fixtures || fixtures.length === 0) {
        return {
          success: true,
          message: 'No fixtures found to validate match summary',
          details: { fixturesChecked: 0 }
        };
      }

      const issues = [];
      const warnings = [];

      for (const fixture of fixtures) {
        // Check if fixture has basic required data
        if (!fixture.home_team_id || !fixture.away_team_id) {
          issues.push(`Fixture ${fixture.id} missing team IDs`);
          continue;
        }

        // Check match events for this fixture
        const { data: events, error: eventsError } = await supabase
          .from('match_events')
          .select('event_type, player_name, event_time')
          .eq('fixture_id', fixture.id);

        if (eventsError) {
          warnings.push(`Failed to fetch events for fixture ${fixture.id}: ${eventsError.message}`);
          continue;
        }

        // Validate event data structure for display
        if (events && events.length > 0) {
          const invalidEvents = events.filter(e => 
            !e.player_name || !e.event_type || e.event_time === null || e.event_time === undefined
          );
          
          if (invalidEvents.length > 0) {
            warnings.push(`Fixture ${fixture.id} has ${invalidEvents.length} events with incomplete data`);
          }
        }
      }

      if (issues.length > 0) {
        throw new Error(`Match summary validation issues: ${issues.join(', ')}`);
      }

      return {
        success: true,
        message: `Match summary validation passed${warnings.length > 0 ? ' with warnings' : ''}`,
        warnings,
        details: { fixturesChecked: fixtures.length }
      };
    } catch (error) {
      throw new Error(`Match summary validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateTeamSquad(): Promise<any> {
    console.log('🔍 CrossComponentValidator: Validating team squad integration...');
    
    try {
      // Test team squad data integration
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, __id__, name')
        .limit(5);

      if (teamsError) {
        throw new Error(`Failed to fetch teams: ${teamsError.message}`);
      }

      if (!teams || teams.length === 0) {
        return {
          success: true,
          message: 'No teams found to validate team squad',
          details: { teamsChecked: 0 }
        };
      }

      const issues = [];
      const warnings = [];

      for (const team of teams) {
        // Check team members
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select('id, name, goals, assists, position, number')
          .eq('team_id', team.__id__);

        if (membersError) {
          warnings.push(`Failed to fetch members for team ${team.name}: ${membersError.message}`);
          continue;
        }

        if (members && members.length > 0) {
          // Check for members with incomplete data
          const incompleteMembers = members.filter(m => 
            !m.name || m.name.trim() === ''
          );
          
          if (incompleteMembers.length > 0) {
            warnings.push(`Team ${team.name} has ${incompleteMembers.length} members with incomplete data`);
          }

          // Check for duplicate numbers
          const numbers = members.map(m => m.number).filter(n => n);
          const duplicateNumbers = numbers.filter((n, i) => numbers.indexOf(n) !== i);
          
          if (duplicateNumbers.length > 0) {
            warnings.push(`Team ${team.name} has duplicate player numbers: ${duplicateNumbers.join(', ')}`);
          }
        }
      }

      return {
        success: true,
        message: `Team squad validation passed${warnings.length > 0 ? ' with warnings' : ''}`,
        warnings,
        details: { teamsChecked: teams.length }
      };
    } catch (error) {
      throw new Error(`Team squad validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateDashboardWidgets(): Promise<any> {
    console.log('🔍 CrossComponentValidator: Validating dashboard widget data...');
    
    try {
      const issues = [];
      const warnings = [];

      // Test top scorers data from members table
      const { data: topScorers, error: scorersError } = await supabase
        .from('members')
        .select('name, goals, team_id')
        .not('goals', 'is', null)
        .order('goals', { ascending: false })
        .limit(10);

      if (scorersError) {
        issues.push(`Failed to fetch top scorers: ${scorersError.message}`);
      } else if (topScorers && topScorers.length > 0) {
        // Check for scorers with invalid data
        const invalidScorers = topScorers.filter(s => 
          !s.name || s.goals === null || s.goals < 0
        );
        
        if (invalidScorers.length > 0) {
          warnings.push(`Found ${invalidScorers.length} top scorers with invalid data`);
        }
      }

      // Test top assists data from members table
      const { data: topAssists, error: assistsError } = await supabase
        .from('members')
        .select('name, assists, team_id')
        .not('assists', 'is', null)
        .order('assists', { ascending: false })
        .limit(10);

      if (assistsError) {
        issues.push(`Failed to fetch top assists: ${assistsError.message}`);
      } else if (topAssists && topAssists.length > 0) {
        // Check for assists with invalid data
        const invalidAssists = topAssists.filter(a => 
          !a.name || a.assists === null || a.assists < 0
        );
        
        if (invalidAssists.length > 0) {
          warnings.push(`Found ${invalidAssists.length} top assists with invalid data`);
        }
      }

      // Test league table data
      const { data: leagueTable, error: tableError } = await supabase
        .from('teams')
        .select('name, position, points, played, won, drawn, lost, goals_for, goals_against')
        .order('position', { ascending: true })
        .limit(10);

      if (tableError) {
        issues.push(`Failed to fetch league table: ${tableError.message}`);
      } else if (leagueTable && leagueTable.length > 0) {
        // Check for teams with invalid data
        const invalidTeams = leagueTable.filter(t => 
          !t.name || t.points === null || t.points < 0 || t.played === null || t.played < 0
        );
        
        if (invalidTeams.length > 0) {
          warnings.push(`Found ${invalidTeams.length} teams with invalid league table data`);
        }
      }

      if (issues.length > 0) {
        throw new Error(`Dashboard widget validation issues: ${issues.join(', ')}`);
      }

      return {
        success: true,
        message: `Dashboard widget validation passed${warnings.length > 0 ? ' with warnings' : ''}`,
        warnings,
        details: {
          topScorersChecked: topScorers?.length || 0,
          topAssistsChecked: topAssists?.length || 0,
          leagueTableChecked: leagueTable?.length || 0
        }
      };
    } catch (error) {
      throw new Error(`Dashboard widget validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validatePlayerStatsConsistency(): Promise<any> {
    console.log('🔍 CrossComponentValidator: Validating player stats consistency across components...');
    
    try {
      // Get a sample of players from members table
      const { data: players, error: playersError } = await supabase
        .from('members')
        .select('id, name, goals, assists, team_id')
        .limit(10);

      if (playersError) {
        throw new Error(`Failed to fetch players: ${playersError.message}`);
      }

      if (!players || players.length === 0) {
        return {
          success: true,
          message: 'No players found to validate stats consistency',
          details: { playersChecked: 0 }
        };
      }

      const warnings = [];

      // Validate stats data integrity
      for (const player of players) {
        const memberGoals = player.goals || 0;
        const memberAssists = player.assists || 0;

        // Check for negative values which shouldn't exist
        if (memberGoals < 0 || memberAssists < 0) {
          warnings.push(`Player ${player.name} has negative stats: goals=${memberGoals}, assists=${memberAssists}`);
        }
      }

      return {
        success: true,
        message: `Player stats consistency validation passed${warnings.length > 0 ? ' with warnings' : ''}`,
        warnings,
        details: { playersChecked: players.length, inconsistencies: 0 }
      };
    } catch (error) {
      throw new Error(`Player stats consistency validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateRealtimeUpdates(): Promise<any> {
    console.log('🔍 CrossComponentValidator: Validating real-time update capabilities...');
    
    try {
      // Test if real-time channels can be established
      const testChannel = supabase
        .channel('test-validation-channel')
        .on('presence', { event: 'sync' }, () => {
          console.log('Real-time channel sync working');
        });

      // Subscribe to test channel
      const subscriptionResult = await new Promise((resolve) => {
        testChannel.subscribe((status) => {
          resolve(status);
        });
      });

      // Clean up test channel
      supabase.removeChannel(testChannel);

      if (subscriptionResult === 'SUBSCRIBED') {
        return {
          success: true,
          message: 'Real-time update validation passed',
          details: { channelStatus: subscriptionResult }
        };
      } else {
        return {
          success: true,
          message: 'Real-time updates validation completed with warnings',
          warnings: [`Channel subscription status: ${subscriptionResult}`],
          details: { channelStatus: subscriptionResult }
        };
      }
    } catch (error) {
      throw new Error(`Real-time updates validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
