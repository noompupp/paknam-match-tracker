
import { supabase } from '@/integrations/supabase/client';
import { incrementPlayerGoals, incrementPlayerAssists } from './playerStatsUpdateService';

interface PlayerStatsSyncResult {
  playersUpdated: number;
  goalsAdded: number;
  assistsAdded: number;
  errors: string[];
}

export const syncExistingMatchEvents = async (): Promise<PlayerStatsSyncResult> => {
  console.log('🔄 PlayerStatsSyncService: Starting sync of existing match events...');
  
  const result: PlayerStatsSyncResult = {
    playersUpdated: 0,
    goalsAdded: 0,
    assistsAdded: 0,
    errors: []
  };

  try {
    // Get all match events with assigned players (not "Unknown Player")
    const { data: matchEvents, error: eventsError } = await supabase
      .from('match_events')
      .select('*')
      .neq('player_name', 'Unknown Player')
      .in('event_type', ['goal', 'assist']);

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

    // Group events by player name and type
    const playerStats = new Map<string, { goals: number; assists: number; playerId?: number }>();

    for (const event of matchEvents) {
      const playerName = event.player_name;
      
      if (!playerStats.has(playerName)) {
        playerStats.set(playerName, { goals: 0, assists: 0 });
      }

      const stats = playerStats.get(playerName)!;
      
      if (event.event_type === 'goal') {
        stats.goals += 1;
      } else if (event.event_type === 'assist') {
        stats.assists += 1;
      }

      // Find matching member by name
      const member = members.find(m => m.name === playerName);
      if (member) {
        stats.playerId = member.id;
      }
    }

    console.log('📊 PlayerStatsSyncService: Calculated stats from match events:', Array.from(playerStats.entries()));

    // Update each player's stats
    for (const [playerName, stats] of playerStats) {
      if (!stats.playerId) {
        result.errors.push(`Player "${playerName}" not found in members table`);
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

        if (goalsToAdd > 0) {
          await incrementPlayerGoals(stats.playerId, goalsToAdd);
          result.goalsAdded += goalsToAdd;
          console.log(`✅ PlayerStatsSyncService: Added ${goalsToAdd} goals to ${playerName}`);
        }

        if (assistsToAdd > 0) {
          await incrementPlayerAssists(stats.playerId, assistsToAdd);
          result.assistsAdded += assistsToAdd;
          console.log(`✅ PlayerStatsSyncService: Added ${assistsToAdd} assists to ${playerName}`);
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

export const validatePlayerStats = async (): Promise<{ isValid: boolean; issues: string[] }> => {
  console.log('🔍 PlayerStatsSyncService: Validating player stats consistency...');
  
  const issues: string[] = [];

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
    console.log(`🔍 PlayerStatsSyncService: Validation ${isValid ? 'passed' : 'failed'}:`, issues);

    return { isValid, issues };

  } catch (error) {
    console.error('❌ PlayerStatsSyncService: Error during validation:', error);
    return { isValid: false, issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] };
  }
};
