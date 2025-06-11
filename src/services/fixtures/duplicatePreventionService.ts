
import { supabase } from '@/integrations/supabase/client';

interface LeagueOperation {
  fixtureId: number;
  operationType: 'score_update' | 'result_finalization' | 'stats_calculation';
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}

export const duplicatePreventionService = {
  async preventDuplicateOperation(operation: LeagueOperation): Promise<{ allowed: boolean; reason?: string; operationHash?: string }> {
    console.log('🛡️ DuplicatePreventionService: Checking for duplicate operation:', operation);
    
    try {
      // Generate operation hash
      const { data: hashData, error: hashError } = await supabase
        .rpc('generate_league_operation_hash', {
          p_fixture_id: operation.fixtureId,
          p_operation_type: operation.operationType,
          p_home_score: operation.homeScore,
          p_away_score: operation.awayScore
        });

      if (hashError) {
        console.error('❌ DuplicatePreventionService: Error generating hash:', hashError);
        throw hashError;
      }

      const operationHash = hashData;
      console.log('🔐 DuplicatePreventionService: Generated operation hash:', operationHash);

      // Check if operation already exists
      const { data: existingOp, error: checkError } = await supabase
        .from('league_table_operations')
        .select('id, created_at')
        .eq('operation_hash', operationHash)
        .maybeSingle();

      if (checkError) {
        console.error('❌ DuplicatePreventionService: Error checking existing operation:', checkError);
        throw checkError;
      }

      if (existingOp) {
        console.warn('🚫 DuplicatePreventionService: Duplicate operation detected');
        return {
          allowed: false,
          reason: `Operation already performed at ${new Date(existingOp.created_at).toLocaleString()}`,
          operationHash
        };
      }

      // Record this operation to prevent future duplicates
      const { error: insertError } = await supabase
        .from('league_table_operations')
        .insert({
          fixture_id: operation.fixtureId,
          operation_type: operation.operationType,
          home_team_id: operation.homeTeamId,
          away_team_id: operation.awayTeamId,
          home_score: operation.homeScore,
          away_score: operation.awayScore,
          operation_hash: operationHash
        });

      if (insertError) {
        console.error('❌ DuplicatePreventionService: Error recording operation:', insertError);
        
        // If it's a unique constraint violation, it means another process just inserted the same operation
        if (insertError.code === '23505') {
          return {
            allowed: false,
            reason: 'Operation was performed by another process simultaneously',
            operationHash
          };
        }
        
        throw insertError;
      }

      console.log('✅ DuplicatePreventionService: Operation allowed and recorded');
      return {
        allowed: true,
        operationHash
      };

    } catch (error) {
      console.error('❌ DuplicatePreventionService: Error in preventDuplicateOperation:', error);
      throw error;
    }
  },

  async getOperationHistory(fixtureId: number): Promise<any[]> {
    console.log('📊 DuplicatePreventionService: Getting operation history for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase
        .from('league_table_operations')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ DuplicatePreventionService: Error fetching operation history:', error);
        throw error;
      }

      console.log(`📊 DuplicatePreventionService: Found ${data?.length || 0} operations`);
      return data || [];

    } catch (error) {
      console.error('❌ DuplicatePreventionService: Error in getOperationHistory:', error);
      throw error;
    }
  },

  async cleanupOldOperations(daysOld: number = 30): Promise<{ deletedCount: number }> {
    console.log(`🧹 DuplicatePreventionService: Cleaning up operations older than ${daysOld} days`);
    
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('league_table_operations')
        .delete()
        .lt('created_at', cutoffDate)
        .select();

      if (error) {
        console.error('❌ DuplicatePreventionService: Error cleaning up operations:', error);
        throw error;
      }

      const deletedCount = data?.length || 0;
      console.log(`✅ DuplicatePreventionService: Cleaned up ${deletedCount} old operations`);
      
      return { deletedCount };

    } catch (error) {
      console.error('❌ DuplicatePreventionService: Error in cleanupOldOperations:', error);
      throw error;
    }
  }
};
