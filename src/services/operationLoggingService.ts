
import { supabase } from '@/integrations/supabase/client';

export interface OperationLogData {
  operation_type: string;
  table_name?: string;
  record_id?: string;
  payload?: any;
  result?: any;
  error_message?: string;
  success: boolean;
}

export const operationLoggingService = {
  async logOperation(data: OperationLogData): Promise<string | null> {
    try {
      console.log('📝 OperationLoggingService: Logging operation:', data.operation_type);
      
      const { data: result, error } = await supabase.rpc('log_operation', {
        p_operation_type: data.operation_type,
        p_table_name: data.table_name || null,
        p_record_id: data.record_id || null,
        p_payload: data.payload || null,
        p_result: data.result || null,
        p_error_message: data.error_message || null,
        p_success: data.success
      });

      if (error) {
        console.error('❌ OperationLoggingService: Failed to log operation:', error);
        return null;
      }

      console.log('✅ OperationLoggingService: Operation logged successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ OperationLoggingService: Critical error logging operation:', error);
      return null;
    }
  },

  async getOperationLogs(limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('operation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ OperationLoggingService: Failed to fetch logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ OperationLoggingService: Critical error fetching logs:', error);
      return [];
    }
  },

  async getFailedOperations(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('operation_logs')
        .select('*')
        .eq('success', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ OperationLoggingService: Failed to fetch failed operations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ OperationLoggingService: Critical error fetching failed operations:', error);
      return [];
    }
  }
};
