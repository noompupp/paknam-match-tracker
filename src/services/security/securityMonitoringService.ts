
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from '@/services/operationLoggingService';

export interface SecurityEvent {
  type: 'auth_attempt' | 'permission_denied' | 'suspicious_activity' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  metadata?: any;
}

export const securityMonitoringService = {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    console.log(`🔒 Security Event [${event.severity.toUpperCase()}]:`, event.description);
    
    try {
      await operationLoggingService.logOperation({
        operation_type: `security_${event.type}`,
        payload: {
          severity: event.severity,
          description: event.description,
          userId: event.userId,
          metadata: event.metadata,
          timestamp: new Date().toISOString()
        },
        success: true
      });

      // For critical events, you might want to send alerts
      if (event.severity === 'critical') {
        console.error('🚨 CRITICAL SECURITY EVENT:', event);
        // In production, you would integrate with monitoring services here
      }
    } catch (error) {
      console.error('❌ Failed to log security event:', error);
    }
  },

  async logFailedAuthAttempt(email: string, reason: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'auth_attempt',
      severity: 'medium',
      description: `Failed authentication attempt for ${email}: ${reason}`,
      metadata: { email, reason, ip: 'client-side' }
    });
  },

  async logPermissionDenied(userId: string, resource: string, action: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'permission_denied',
      severity: 'medium',
      description: `User ${userId} denied access to ${resource} for action ${action}`,
      userId,
      metadata: { resource, action }
    });
  },

  async logSuspiciousActivity(userId: string, activity: string, details: any): Promise<void> {
    await this.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      description: `Suspicious activity detected for user ${userId}: ${activity}`,
      userId,
      metadata: details
    });
  },

  async logDataAccess(userId: string, table: string, operation: string, recordCount: number): Promise<void> {
    // Only log bulk operations or sensitive table access
    if (recordCount > 100 || ['members', 'auth_roles'].includes(table)) {
      await this.logSecurityEvent({
        type: 'data_access',
        severity: recordCount > 1000 ? 'high' : 'low',
        description: `User ${userId} performed ${operation} on ${recordCount} records in ${table}`,
        userId,
        metadata: { table, operation, recordCount }
      });
    }
  },

  async getSecurityLogs(limit: number = 50): Promise<any[]> {
    try {
      const logs = await operationLoggingService.getOperationLogs(limit);
      return logs.filter(log => log.operation_type.startsWith('security_'));
    } catch (error) {
      console.error('❌ Failed to fetch security logs:', error);
      return [];
    }
  },

  async getFailedOperations(limit: number = 25): Promise<any[]> {
    try {
      return await operationLoggingService.getFailedOperations(limit);
    } catch (error) {
      console.error('❌ Failed to fetch failed operations:', error);
      return [];
    }
  }
};
