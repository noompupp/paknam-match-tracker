
import { supabase } from '@/integrations/supabase/client';
import { incrementPlayerGoals, incrementPlayerAssists } from './playerStatsUpdateService';

interface PlayerStatsSyncResult {
  playersUpdated: number;
  goalsAdded: number;
  assistsAdded: number;
  errors: string[];
  warnings: string[];
  details: {
    goalEvents: number;
    assistEvents: number;
    playersWithoutMatch: string[];
    duplicateEvents: number;
  };
}

export const syncExistingMatchEvents = async (): Promise<PlayerStatsSyncResult> => {
  console.log('🔄 PlayerStatsSyncService: Starting comprehensive sync of existing match events...');
  
  const result: PlayerStatsSyncResult = {
    playersUpdated: 0,
    goalsAdded: 0,
    assistsAdded: 0,
    errors: [],
    warnings: [],
    details: {
      goalEvents: 0,
      assistEvents: 0,
      playersWithoutMatch: [],
      duplicateEvents: 0
    }
  };

  try {
    // Get all match events with assigned players (not "Unknown Player")
    const { data: matchEvents, error: eventsError } = await supabase
      .from('match_events')
      .select('*')
      .neq('player_name', 'Unknown Player')
      .in('event_type', ['goal', 'assist'])
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('❌ PlayerStatsSyncService: Error fetching match events:', eventsError);
      throw eventsError;
    }

    if (!matchEvents || matchEvents.length === 0) {
      console.log('📊 PlayerStatsSyncService: No assigned match events found to sync');
      return result;
    }

    console.log(`📊 PlayerStatsSyncService: Found ${matchEvents.length} assigned match events to sync`);

    // Get all members to match by name
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, name, goals, assists');

    if (membersError) {
      console.error('❌ PlayerStatsSyncService: Error fetching members:', membersError);
      throw membersError;
    }

    if (!members) {
      throw new Error('No members found in database');
    }

    // Group events by player name and type, track duplicates
    const playerStats = new Map<string, { 
      goals: number; 
      assists: number; 
      playerId?: number;
      goalEvents: any[];
      assistEvents: any[];
    }>();

    for (const event of matchEvents) {
      const playerName = event.player_name;
      
      if (!playerStats.has(playerName)) {
        playerStats.set(playerName, { 
          goals: 0, 
          assists: 0,
          goalEvents: [],
          assistEvents: []
        });
      }

      const stats = playerStats.get(playerName)!;
      
      if (event.event_type === 'goal') {
        stats.goals += 1;
        stats.goalEvents.push(event);
        result.details.goalEvents += 1;
      } else if (event.event_type === 'assist') {
        stats.assists += 1;
        stats.assistEvents.push(event);
        result.details.assistEvents += 1;
      }

      // Find matching member by name (case-insensitive)
      const member = members.find(m => 
        m.name?.toLowerCase() === playerName.toLowerCase()
      );
      if (member) {
        stats.playerId = member.id;
      }
    }

    console.log('📊 PlayerStatsSyncService: Calculated stats from match events:', 
      Array.from(playerStats.entries()).map(([name, stats]) => ({
        name,
        goals: stats.goals,
        assists: stats.assists,
        hasPlayerId: !!stats.playerId
      }))
    );

    // Update each player's stats
    for (const [playerName, stats] of playerStats) {
      if (!stats.playerId) {
        result.errors.push(`Player "${playerName}" not found in members table`);
        result.details.playersWithoutMatch.push(playerName);
        continue;
      }

      try {
        // Get current stats
        const member = members.find(m => m.id === stats.playerId);
        if (!member) continue;

        const currentGoals = member.goals || 0;
        const currentAssists = member.assists || 0;

        // Calculate the difference (what we need to add)
        const goalsToAdd = Math.max(0, stats.goals - currentGoals);
        const assistsToAdd = Math.max(0, stats.assists - currentAssists);

        // Check for potential issues
        if (stats.goals < currentGoals) {
          result.warnings.push(
            `Player ${playerName} has more goals in database (${currentGoals}) than in match events (${stats.goals})`
          );
        }
        
        if (stats.assists < currentAssists) {
          result.warnings.push(
            `Player ${playerName} has more assists in database (${currentAssists}) than in match events (${stats.assists})`
          );
        }

        if (goalsToAdd > 0) {
          await incrementPlayerGoals(stats.playerId, goalsToAdd);
          result.goalsAdded += goalsToAdd;
          console.log(`✅ PlayerStatsSyncService: Added ${goalsToAdd} goals to ${playerName} (${currentGoals} → ${currentGoals + goalsToAdd})`);
        }

        if (assistsToAdd > 0) {
          await incrementPlayerAssists(stats.playerId, assistsToAdd);
          result.assistsAdded += assistsToAdd;
          console.log(`✅ PlayerStatsSyncService: Added ${assistsToAdd} assists to ${playerName} (${currentAssists} → ${currentAssists + assistsToAdd})`);
        }

        if (goalsToAdd > 0 || assistsToAdd > 0) {
          result.playersUpdated += 1;
        }

      } catch (error) {
        const errorMsg = `Failed to update stats for ${playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error('❌ PlayerStatsSyncService:', errorMsg);
      }
    }

    console.log('✅ PlayerStatsSyncService: Sync completed:', result);
    return result;

  } catch (error) {
    console.error('❌ PlayerStatsSyncService: Critical error during sync:', error);
    throw error;
  }
};

export const validatePlayerStats = async (): Promise<{ isValid: boolean; issues: string[]; summary: any }> => {
  console.log('🔍 PlayerStatsSyncService: Validating player stats consistency...');
  
  const issues: string[] = [];
  const summary = {
    totalMembers: 0,
    membersWithGoals: 0,
    membersWithAssists: 0,
    totalGoalEvents: 0,
    totalAssistEvents: 0,
    unassignedGoalEvents: 0,
    unassignedAssistEvents: 0,
    consistentPlayers: 0,
    inconsistentPlayers: 0
  };

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
      .in('event_type', ['goal', 'assist']);

    if (eventsError) throw eventsError;

    if (!members || !matchEvents) {
      return { isValid: true, issues: [], summary };
    }

    summary.totalMembers = members.length;
    summary.membersWithGoals = members.filter(m => (m.goals || 0) > 0).length;
    summary.membersWithAssists = members.filter(m => (m.assists || 0) > 0).length;
    
    const assignedEvents = matchEvents.filter(e => e.player_name !== 'Unknown Player');
    const unassignedEvents = matchEvents.filter(e => e.player_name === 'Unknown Player');
    
    summary.totalGoalEvents = matchEvents.filter(e => e.event_type === 'goal').length;
    summary.totalAssistEvents = matchEvents.filter(e => e.event_type === 'assist').length;
    summary.unassignedGoalEvents = unassignedEvents.filter(e => e.event_type === 'goal').length;
    summary.unassignedAssistEvents = unassignedEvents.filter(e => e.event_type === 'assist').length;

    // Calculate expected stats from assigned match events only
    const expectedStats = new Map<string, { goals: number; assists: number }>();

    for (const event of assignedEvents) {
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
    for (const member of members) {
      const expected = expectedStats.get(member.name) || { goals: 0, assists: 0 };
      const actual = { goals: member.goals || 0, assists: member.assists || 0 };

      let isConsistent = true;

      if (expected.goals !== actual.goals) {
        issues.push(`${member.name}: Expected ${expected.goals} goals, has ${actual.goals}`);
        isConsistent = false;
      }

      if (expected.assists !== actual.assists) {
        issues.push(`${member.name}: Expected ${expected.assists} assists, has ${actual.assists}`);
        isConsistent = false;
      }

      if (isConsistent && (expected.goals > 0 || expected.assists > 0)) {
        summary.consistentPlayers += 1;
      } else if (!isConsistent) {
        summary.inconsistentPlayers += 1;
      }
    }

    // Check for unassigned events
    if (summary.unassignedGoalEvents > 0) {
      issues.push(`${summary.unassignedGoalEvents} goal events are unassigned (marked as "Unknown Player")`);
    }
    
    if (summary.unassignedAssistEvents > 0) {
      issues.push(`${summary.unassignedAssistEvents} assist events are unassigned (marked as "Unknown Player")`);
    }

    const isValid = issues.length === 0;
    console.log(`🔍 PlayerStatsSyncService: Validation ${isValid ? 'passed' : 'failed'}:`, { issues, summary });

    return { isValid, issues, summary };

  } catch (error) {
    console.error('❌ PlayerStatsSyncService: Error during validation:', error);
    return { 
      isValid: false, 
      issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      summary 
    };
  }
};

export const cleanupDuplicateEvents = async (): Promise<{ removedEvents: number; errors: string[] }> => {
  console.log('🧹 PlayerStatsSyncService: Starting cleanup of duplicate events...');
  
  const result = {
    removedEvents: 0,
    errors: []
  };

  try {
    // Find potential duplicate events (same fixture, same event type, same time, different players)
    const { data: events, error } = await supabase
      .from('match_events')
      .select('*')
      .in('event_type', ['goal', 'assist'])
      .order('fixture_id, event_type, event_time, created_at');

    if (error) throw error;
    if (!events || events.length === 0) return result;

    // Group events by fixture_id, event_type, and event_time
    const eventGroups = new Map<string, any[]>();
    
    for (const event of events) {
      const key = `${event.fixture_id}-${event.event_type}-${event.event_time}`;
      if (!eventGroups.has(key)) {
        eventGroups.set(key, []);
      }
      eventGroups.get(key)!.push(event);
    }

    // Find groups with both "Unknown Player" and assigned player events
    for (const [key, groupEvents] of eventGroups) {
      if (groupEvents.length <= 1) continue;

      const unknownPlayerEvents = groupEvents.filter(e => e.player_name === 'Unknown Player');
      const assignedPlayerEvents = groupEvents.filter(e => e.player_name !== 'Unknown Player');

      // If we have both unknown and assigned events for the same fixture/type/time, remove the unknown ones
      if (unknownPlayerEvents.length > 0 && assignedPlayerEvents.length > 0) {
        for (const unknownEvent of unknownPlayerEvents) {
          try {
            const { error: deleteError } = await supabase
              .from('match_events')
              .delete()
              .eq('id', unknownEvent.id);

            if (deleteError) {
              result.errors.push(`Failed to delete duplicate event ${unknownEvent.id}: ${deleteError.message}`);
            } else {
              result.removedEvents += 1;
              console.log(`🗑️ PlayerStatsSyncService: Removed duplicate unknown player event:`, unknownEvent);
            }
          } catch (error) {
            result.errors.push(`Error deleting event ${unknownEvent.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    }

    console.log('✅ PlayerStatsSyncService: Cleanup completed:', result);
    return result;

  } catch (error) {
    console.error('❌ PlayerStatsSyncService: Error during cleanup:', error);
    result.errors.push(`Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};
