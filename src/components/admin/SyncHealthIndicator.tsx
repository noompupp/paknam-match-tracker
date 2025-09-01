import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useEnhancedSync } from '@/hooks/useEnhancedSync';

export const SyncHealthIndicator = () => {
  const {
    syncHealth,
    isCheckingHealth,
    recheckHealth,
    performManualSync,
    isPerformingManualSync,
    hasDiscrepancies,
    isHealthy,
    needsAttention,
    lastSyncResult
  } = useEnhancedSync();

  if (isCheckingHealth) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking sync status...</span>
      </div>
    );
  }

  if (!syncHealth) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => recheckHealth()}
        className="text-muted-foreground"
      >
        <RefreshCw className="w-4 h-4 mr-1" />
        Check Sync Status
      </Button>
    );
  }

  const getSyncHealthColor = () => {
    if (isHealthy) return 'default';
    if (needsAttention) return 'destructive';
    return 'secondary';
  };

  const getSyncHealthIcon = () => {
    if (isHealthy) return <CheckCircle className="w-4 h-4" />;
    if (needsAttention) return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getSyncHealthLabel = () => {
    if (isHealthy) return 'Healthy';
    if (syncHealth.sync_health === 'unhealthy') return 'Issues Detected';
    if (syncHealth.sync_health === 'stale') return 'Stale Data';
    return 'Unknown';
  };

  return (
    <div className="space-y-3">
      {/* Sync Health Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={getSyncHealthColor()} className="flex items-center gap-1">
            {getSyncHealthIcon()}
            {getSyncHealthLabel()}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => recheckHealth()}
            disabled={isCheckingHealth}
            className="h-6 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {needsAttention && (
          <Button
            size="sm"
            onClick={() => performManualSync()}
            disabled={isPerformingManualSync}
            className="h-6"
          >
            {isPerformingManualSync ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Fixing...
              </>
            ) : (
              'Fix Now'
            )}
          </Button>
        )}
      </div>

      {/* Discrepancies Alert */}
      {hasDiscrepancies && syncHealth.discrepancy_status.discrepancies.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="font-medium mb-2">
              {syncHealth.discrepancy_status.discrepancy_count} data inconsistencies detected
            </div>
            <div className="space-y-1 text-xs">
              {syncHealth.discrepancy_status.discrepancies.slice(0, 3).map((discrepancy, index) => (
                <div key={index} className="text-muted-foreground">
                  <span className="font-medium">{discrepancy.player_name}:</span>
                  {discrepancy.goals_diff !== 0 && (
                    <span className="ml-1">
                      Goals: {discrepancy.stored_goals} → {discrepancy.actual_goals}
                    </span>
                  )}
                  {discrepancy.assists_diff !== 0 && (
                    <span className="ml-1">
                      Assists: {discrepancy.stored_assists} → {discrepancy.actual_assists}
                    </span>
                  )}
                </div>
              ))}
              {syncHealth.discrepancy_status.discrepancy_count > 3 && (
                <div className="text-muted-foreground text-xs">
                  ... and {syncHealth.discrepancy_status.discrepancy_count - 3} more
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Last Sync Result */}
      {lastSyncResult && lastSyncResult.success && lastSyncResult.discrepancies_fixed > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            ✅ Fixed {lastSyncResult.discrepancies_fixed} data inconsistencies. 
            Updated {lastSyncResult.players_updated} players.
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>
          Events: {syncHealth.total_goal_assist_events} goals/assists | 
          Players: {syncHealth.total_players_with_stats} with stats
        </div>
        {syncHealth.last_sync && (
          <div>
            Last sync: {new Date(syncHealth.last_sync).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};