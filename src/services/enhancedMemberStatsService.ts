
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from './operationLoggingService';

export interface MemberStatsUpdate {
  memberId: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  totalMinutesPlayed?: number;
  matchesPlayed?: number;
}

export const enhancedMemberStatsService = {
  async updateMemberStats(update: MemberStatsUpdate): Promise<{ success: boolean; message: string; data?: any }> {
    const logData = {
      operation_type: 'update_member_stats',
      table_name: 'members',
      record_id: update.memberId.toString(),
      payload: update,
      result: null,
      error_message: null,
      success: false
    };

    try {
      console.log('🔄 EnhancedMemberStatsService: Updating member stats:', update);

      // Use the safe update function
      const { data: result, error } = await supabase.rpc('safe_update_member_stats', {
        p_member_id: update.memberId,
        p_goals: update.goals || null,
        p_assists: update.assists || null,
        p_yellow_cards: update.yellowCards || null,
        p_red_cards: update.redCards || null,
        p_total_minutes_played: update.totalMinutesPlayed || null,
        p_matches_played: update.matchesPlayed || null
      });

      if (error) {
        console.error('❌ EnhancedMemberStatsService: Database error:', error);
        logData.error_message = error.message;
        logData.success = false;
        await operationLoggingService.logOperation(logData);
        
        return {
          success: false,
          message: `Database error: ${error.message}`
        };
      }

      if (!result || !result.success) {
        const errorMsg = result?.error || 'Unknown error from safe_update_member_stats';
        console.error('❌ EnhancedMemberStatsService: Function error:', errorMsg);
        logData.error_message = errorMsg;
        logData.success = false;
        await operationLoggingService.logOperation(logData);
        
        return {
          success: false,
          message: errorMsg
        };
      }

      logData.result = result;
      logData.success = true;
      await operationLoggingService.logOperation(logData);

      console.log('✅ EnhancedMemberStatsService: Member stats updated successfully:', result);
      
      return {
        success: true,
        message: `Member ${update.memberId} stats updated successfully`,
        data: result
      };

    } catch (error) {
      console.error('❌ EnhancedMemberStatsService: Critical error:', error);
      logData.error_message = error instanceof Error ? error.message : 'Unknown critical error';
      logData.success = false;
      await operationLoggingService.logOperation(logData);

      return {
        success: false,
        message: 'Critical error updating member stats'
      };
    }
  },

  async batchUpdateMemberStats(updates: MemberStatsUpdate[]): Promise<{ 
    success: boolean; 
    message: string; 
    results: Array<{ memberId: number; success: boolean; message: string }> 
  }> {
    console.log('🔄 EnhancedMemberStatsService: Batch updating member stats:', updates.length);
    
    const results = [];
    let successCount = 0;

    for (const update of updates) {
      const result = await this.updateMemberStats(update);
      results.push({
        memberId: update.memberId,
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        successCount++;
      }
    }

    return {
      success: successCount === updates.length,
      message: `Updated ${successCount}/${updates.length} member stats`,
      results
    };
  },

  async validateMemberExists(memberId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id')
        .eq('id', memberId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('❌ EnhancedMemberStatsService: Error checking member existence:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('❌ EnhancedMemberStatsService: Critical error validating member:', error);
      return false;
    }
  }
};
