
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from './operationLoggingService';

export interface TimeAggregationResult {
  success: boolean;
  playersUpdated: number;
  totalMinutesAggregated: number;
  errors: string[];
  message: string;
}

export const playerTimeAggregationService = {
  async aggregatePlayerTimesToMembers(): Promise<TimeAggregationResult> {
    console.log('🔄 PlayerTimeAggregationService: Starting time aggregation process...');
    
    const result: TimeAggregationResult = {
      success: false,
      playersUpdated: 0,
      totalMinutesAggregated: 0,
      errors: [],
      message: ''
    };

    try {
      // Get all player time tracking data
      const { data: playerTimes, error: timeError } = await supabase
        .from('player_time_tracking')
        .select('player_id, player_name, total_minutes');

      if (timeError) {
        result.errors.push(`Error fetching player times: ${timeError.message}`);
        return result;
      }

      if (!playerTimes || playerTimes.length === 0) {
        result.message = 'No player time data found to aggregate';
        result.success = true;
        return result;
      }

      // Group by player and sum total minutes
      const playerTimeMap = new Map<number, { name: string; totalMinutes: number; matches: number }>();
      
      playerTimes.forEach(time => {
        const playerId = time.player_id;
        const existing = playerTimeMap.get(playerId) || { name: time.player_name, totalMinutes: 0, matches: 0 };
        existing.totalMinutes += time.total_minutes;
        existing.matches += 1;
        playerTimeMap.set(playerId, existing);
      });

      console.log('📊 PlayerTimeAggregationService: Aggregated data for players:', {
        playersCount: playerTimeMap.size,
        totalRecords: playerTimes.length
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
            result.errors.push(`Error updating player ${data.name} (${playerId}): ${updateError.message}`);
          } else {
            result.playersUpdated++;
            result.totalMinutesAggregated += data.totalMinutes;
            
            console.log(`✅ PlayerTimeAggregationService: Updated player ${data.name} with ${data.totalMinutes} minutes`);
          }
        } catch (error) {
          result.errors.push(`Critical error updating player ${data.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.playersUpdated > 0;
      result.message = `Successfully updated ${result.playersUpdated} players with ${result.totalMinutesAggregated} total minutes`;

      // Log the operation
      await operationLoggingService.logOperation({
        operation_type: 'aggregate_player_times',
        table_name: 'members',
        record_id: 'bulk_update',
        payload: { playersProcessed: playerTimeMap.size },
        result: result,
        error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
        success: result.success
      });

      console.log('✅ PlayerTimeAggregationService: Time aggregation completed:', result);
      return result;

    } catch (error) {
      console.error('❌ PlayerTimeAggregationService: Critical error:', error);
      result.errors.push(`Critical aggregation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.message = 'Time aggregation failed due to critical errors';
      return result;
    }
  },

  async aggregateTimeForSpecificPlayer(playerId: number): Promise<{ success: boolean; message: string }> {
    console.log('🔄 PlayerTimeAggregationService: Aggregating time for specific player:', playerId);
    
    try {
      // Get all time records for this player
      const { data: playerTimes, error: timeError } = await supabase
        .from('player_time_tracking')
        .select('total_minutes')
        .eq('player_id', playerId);

      if (timeError) {
        return { success: false, message: `Error fetching player times: ${timeError.message}` };
      }

      const totalMinutes = playerTimes?.reduce((sum, record) => sum + record.total_minutes, 0) || 0;
      const matchesPlayed = playerTimes?.length || 0;

      // Update the member record
      const { error: updateError } = await supabase
        .from('members')
        .update({
          total_minutes_played: totalMinutes,
          matches_played: matchesPlayed,
          updated_at: new Date().toISOString()
        })
        .eq('id', playerId);

      if (updateError) {
        return { success: false, message: `Error updating player: ${updateError.message}` };
      }

      console.log(`✅ PlayerTimeAggregationService: Updated player ${playerId} with ${totalMinutes} minutes from ${matchesPlayed} matches`);
      return { success: true, message: `Updated player with ${totalMinutes} minutes from ${matchesPlayed} matches` };

    } catch (error) {
      console.error('❌ PlayerTimeAggregationService: Error aggregating time for player:', error);
      return { success: false, message: `Critical error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
};
