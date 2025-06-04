
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from '../operationLoggingService';

export interface DataSyncResult {
  success: boolean;
  playersUpdated: number;
  goalsAdded: number;
  assistsAdded: number;
  cardsAdded: number;
  minutesAggregated: number;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface ValidationResult {
  isValid: boolean;
  invalid: number;
  issues: string[];
}

export const comprehensiveDataSyncService = {
  async performFullDataSync(): Promise<DataSyncResult> {
    console.log('🔄 ComprehensiveDataSyncService: Starting full data synchronization...');
    
    const result: DataSyncResult = {
      success: false,
      playersUpdated: 0,
      goalsAdded: 0,
      assistsAdded: 0,
      cardsAdded: 0,
      minutesAggregated: 0,
      errors: [],
      warnings: [],
      summary: ''
    };

    try {
      // Step 1: Sync match events to member stats
      console.log('📊 ComprehensiveDataSyncService: Step 1 - Syncing match events to member stats...');
      await this.syncMatchEventsToMembers(result);

      // Step 2: Aggregate player time tracking data
      console.log('⏱️ ComprehensiveDataSyncService: Step 2 - Aggregating player time data...');
      await this.aggregatePlayerTimeData(result);

      // Step 3: Validate data consistency
      console.log('✅ ComprehensiveDataSyncService: Step 3 - Validating data consistency...');
      await this.validateDataConsistency(result);

      result.success = true;
      result.summary = this.generateSyncSummary(result);
      
      // Log the operation
      await operationLoggingService.logOperation({
        operation_type: 'comprehensive_data_sync',
        table_name: 'multiple',
        record_id: 'bulk_operation',
        payload: { syncType: 'full' },
        result: result,
        error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
        success: result.success
      });

      console.log('✅ ComprehensiveDataSyncService: Full synchronization completed successfully');
      return result;

    } catch (error) {
      console.error('❌ ComprehensiveDataSyncService: Critical error during synchronization:', error);
      result.errors.push(`Critical sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.summary = 'Synchronization failed due to critical errors';
      return result;
    }
  },

  async syncMatchEventsToMembers(result: DataSyncResult): Promise<void> {
    try {
      // Get all match events
      const { data: matchEvents, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .order('fixture_id', { ascending: true });

      if (eventsError) {
        result.errors.push(`Error fetching match events: ${eventsError.message}`);
        return;
      }

      if (!matchEvents || matchEvents.length === 0) {
        result.warnings.push('No match events found to sync');
        return;
      }

      // Group events by player
      const playerStats = new Map<string, {
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
        playerName: string;
      }>();

      matchEvents.forEach(event => {
        const playerKey = `${event.player_name}_${event.team_id}`;
        if (!playerStats.has(playerKey)) {
          playerStats.set(playerKey, {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            playerName: event.player_name
          });
        }

        const stats = playerStats.get(playerKey)!;
        
        switch (event.event_type) {
          case 'goal':
            stats.goals += 1;
            result.goalsAdded += 1;
            break;
          case 'assist':
            stats.assists += 1;
            result.assistsAdded += 1;
            break;
          case 'card':
            if (event.card_type === 'yellow') {
              stats.yellowCards += 1;
            } else if (event.card_type === 'red') {
              stats.redCards += 1;
            }
            result.cardsAdded += 1;
            break;
        }
      });

      // Update member records
      for (const [playerKey, stats] of playerStats) {
        try {
          const [playerName, teamId] = playerKey.split('_');
          
          // Find the member by name and team
          const { data: member, error: memberError } = await supabase
            .from('members')
            .select('id, goals, assists, yellow_cards, red_cards')
            .eq('name', stats.playerName)
            .eq('team_id', teamId)
            .maybeSingle();

          if (memberError) {
            result.errors.push(`Error finding member ${stats.playerName}: ${memberError.message}`);
            continue;
          }

          if (!member) {
            result.warnings.push(`Member not found: ${stats.playerName} in team ${teamId}`);
            continue;
          }

          // Only update if there are changes
          const currentGoals = member.goals || 0;
          const currentAssists = member.assists || 0;
          const currentYellowCards = member.yellow_cards || 0;
          const currentRedCards = member.red_cards || 0;

          if (currentGoals !== stats.goals || 
              currentAssists !== stats.assists || 
              currentYellowCards !== stats.yellowCards || 
              currentRedCards !== stats.redCards) {
            
            const { error: updateError } = await supabase
              .from('members')
              .update({
                goals: stats.goals,
                assists: stats.assists,
                yellow_cards: stats.yellowCards,
                red_cards: stats.redCards,
                updated_at: new Date().toISOString(),
                sync_status: 'synced'
              })
              .eq('id', member.id);

            if (updateError) {
              result.errors.push(`Error updating member ${stats.playerName}: ${updateError.message}`);
            } else {
              result.playersUpdated += 1;
              console.log(`✅ ComprehensiveDataSyncService: Updated ${stats.playerName} with ${stats.goals} goals, ${stats.assists} assists`);
            }
          }
        } catch (error) {
          result.errors.push(`Critical error updating player ${playerKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`📊 ComprehensiveDataSyncService: Match events sync completed: ${result.playersUpdated} players updated`);
    } catch (error) {
      result.errors.push(`Critical error in match events sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async aggregatePlayerTimeData(result: DataSyncResult): Promise<void> {
    try {
      // Get all player time tracking data
      const { data: playerTimes, error: timeError } = await supabase
        .from('player_time_tracking')
        .select('player_id, player_name, total_minutes');

      if (timeError) {
        result.errors.push(`Error fetching player times: ${timeError.message}`);
        return;
      }

      if (!playerTimes || playerTimes.length === 0) {
        result.warnings.push('No player time data found to aggregate');
        return;
      }

      // Group by player and sum total minutes
      const playerTimeMap = new Map<number, { totalMinutes: number; matches: number }>();
      
      playerTimes.forEach(time => {
        const playerId = time.player_id;
        const existing = playerTimeMap.get(playerId) || { totalMinutes: 0, matches: 0 };
        existing.totalMinutes += time.total_minutes;
        existing.matches += 1;
        playerTimeMap.set(playerId, existing);
      });

      // Update each member's total minutes
      for (const [playerId, data] of playerTimeMap) {
        try {
          const { error: updateError } = await supabase
            .from('members')
            .update({
              total_minutes_played: data.totalMinutes,
              matches_played: data.matches,
              updated_at: new Date().toISOString()
            })
            .eq('id', playerId);

          if (updateError) {
            result.errors.push(`Error updating player ${playerId} minutes: ${updateError.message}`);
          } else {
            result.minutesAggregated += data.totalMinutes;
          }
        } catch (error) {
          result.errors.push(`Critical error updating player ${playerId} minutes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`⏱️ ComprehensiveDataSyncService: Player time aggregation completed: ${result.minutesAggregated} total minutes`);
    } catch (error) {
      result.errors.push(`Critical error in player time aggregation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async validateDataConsistency(result: DataSyncResult): Promise<void> {
    try {
      const validationResult = await this.validateAllPlayerStats();
      
      if (!validationResult.isValid) {
        result.warnings.push(`Data validation found ${validationResult.issues.length} inconsistencies`);
        result.warnings.push(...validationResult.issues);
      } else {
        console.log('✅ ComprehensiveDataSyncService: Data validation passed');
      }
    } catch (error) {
      result.errors.push(`Error during data validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async validateAllPlayerStats(): Promise<ValidationResult> {
    console.log('🔍 ComprehensiveDataSyncService: Validating all player stats...');
    
    const result: ValidationResult = {
      isValid: true,
      invalid: 0,
      issues: []
    };

    try {
      // Get all members with their stats
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, name, team_id, goals, assists, yellow_cards, red_cards, total_minutes_played');

      if (membersError) {
        throw membersError;
      }

      // Get all match events for comparison
      const { data: matchEvents, error: eventsError } = await supabase
        .from('match_events')
        .select('player_name, team_id, event_type, card_type');

      if (eventsError) {
        throw eventsError;
      }

      // Validate each member's stats against match events
      for (const member of members || []) {
        const memberEvents = matchEvents?.filter(event => 
          event.player_name === member.name && event.team_id === member.team_id
        ) || [];

        const eventGoals = memberEvents.filter(e => e.event_type === 'goal').length;
        const eventAssists = memberEvents.filter(e => e.event_type === 'assist').length;
        const eventYellowCards = memberEvents.filter(e => e.event_type === 'card' && e.card_type === 'yellow').length;
        const eventRedCards = memberEvents.filter(e => e.event_type === 'card' && e.card_type === 'red').length;

        const memberGoals = member.goals || 0;
        const memberAssists = member.assists || 0;
        const memberYellowCards = member.yellow_cards || 0;
        const memberRedCards = member.red_cards || 0;

        if (memberGoals !== eventGoals) {
          result.isValid = false;
          result.invalid += 1;
          result.issues.push(`${member.name}: Goals mismatch (member: ${memberGoals}, events: ${eventGoals})`);
        }

        if (memberAssists !== eventAssists) {
          result.isValid = false;
          result.invalid += 1;
          result.issues.push(`${member.name}: Assists mismatch (member: ${memberAssists}, events: ${eventAssists})`);
        }

        if (memberYellowCards !== eventYellowCards) {
          result.isValid = false;
          result.invalid += 1;
          result.issues.push(`${member.name}: Yellow cards mismatch (member: ${memberYellowCards}, events: ${eventYellowCards})`);
        }

        if (memberRedCards !== eventRedCards) {
          result.isValid = false;
          result.invalid += 1;
          result.issues.push(`${member.name}: Red cards mismatch (member: ${memberRedCards}, events: ${eventRedCards})`);
        }
      }

      console.log('📊 ComprehensiveDataSyncService: Validation completed:', {
        totalMembers: members?.length || 0,
        invalid: result.invalid,
        isValid: result.isValid
      });

      return result;
    } catch (error) {
      console.error('❌ ComprehensiveDataSyncService: Error during validation:', error);
      throw error;
    }
  },

  generateSyncSummary(result: DataSyncResult): string {
    const parts = [];
    
    if (result.playersUpdated > 0) {
      parts.push(`Updated ${result.playersUpdated} players`);
    }
    
    if (result.goalsAdded > 0) {
      parts.push(`${result.goalsAdded} goals synced`);
    }
    
    if (result.assistsAdded > 0) {
      parts.push(`${result.assistsAdded} assists synced`);
    }
    
    if (result.cardsAdded > 0) {
      parts.push(`${result.cardsAdded} cards synced`);
    }
    
    if (result.minutesAggregated > 0) {
      parts.push(`${result.minutesAggregated} minutes aggregated`);
    }
    
    if (result.errors.length > 0) {
      parts.push(`${result.errors.length} errors occurred`);
    }
    
    if (result.warnings.length > 0) {
      parts.push(`${result.warnings.length} warnings`);
    }
    
    return parts.length > 0 
      ? `Comprehensive sync completed: ${parts.join(', ')}`
      : 'Comprehensive sync completed with no changes needed';
  }
};
