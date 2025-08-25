import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEnhancedSync } from '@/hooks/useEnhancedSync';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

export const SyncHealthMonitor: React.FC = () => {
  const {
    syncHealth,
    isCheckingHealth,
    recheckHealth,
    performManualSync,
    isPerformingManualSync,
    triggerBackgroundSync,
    isPerformingBackgroundSync,
    checkDiscrepancies,
    isCheckingDiscrepancies,
    hasDiscrepancies,
    isHealthy,
    needsAttention,
    lastSyncResult
  } = useEnhancedSync();

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'default';
      case 'stale': return 'secondary';
      case 'unhealthy': return 'destructive';
      default: return 'outline';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'stale': return <Clock className="h-4 w-4" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Health Monitor
          </CardTitle>
          <CardDescription>
            Monitor and manage player statistics synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Health Status:</span>
              {syncHealth && (
                <Badge variant={getHealthBadgeVariant((syncHealth as any).sync_health)} className="flex items-center gap-1">
                  {getHealthIcon((syncHealth as any).sync_health)}
                  {(syncHealth as any).sync_health.charAt(0).toUpperCase() + (syncHealth as any).sync_health.slice(1)}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => recheckHealth()}
              disabled={isCheckingHealth}
            >
              {isCheckingHealth ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {/* Quick Stats */}
          {syncHealth && typeof syncHealth === 'object' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{(syncHealth as any).total_goal_assist_events}</div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{(syncHealth as any).total_players_with_stats}</div>
                <div className="text-xs text-muted-foreground">Players with Stats</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-destructive">
                  {(syncHealth as any).discrepancy_status?.discrepancy_count || 0}
                </div>
                <div className="text-xs text-muted-foreground">Discrepancies</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-secondary">
                  {(syncHealth as any).last_sync ? new Date((syncHealth as any).last_sync).toLocaleTimeString() : 'Never'}
                </div>
                <div className="text-xs text-muted-foreground">Last Sync</div>
              </div>
            </div>
          )}

          {/* Discrepancy Alert */}
          {hasDiscrepancies && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sync Discrepancies Detected</AlertTitle>
              <AlertDescription>
                {(syncHealth as any)?.discrepancy_status?.discrepancy_count} players have mismatched statistics. 
                Manual sync is recommended to fix these issues.
              </AlertDescription>
            </Alert>
          )}

          {/* Last Sync Result */}
          {lastSyncResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Last Manual Sync Results</AlertTitle>
              <AlertDescription>
                Fixed {lastSyncResult.discrepancies_fixed} discrepancies, 
                updated {lastSyncResult.players_updated} players at{' '}
                {new Date(lastSyncResult.manual_sync_at).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => performManualSync()}
              disabled={isPerformingManualSync}
              variant={hasDiscrepancies ? "default" : "outline"}
            >
              {isPerformingManualSync ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Manual Sync
            </Button>

            <Button
              onClick={() => triggerBackgroundSync()}
              disabled={isPerformingBackgroundSync}
              variant="secondary"
            >
              {isPerformingBackgroundSync ? (
                <Zap className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Background Sync
            </Button>

            <Button
              onClick={() => checkDiscrepancies()}
              disabled={isCheckingDiscrepancies}
              variant="outline"
            >
              {isCheckingDiscrepancies ? (
                <AlertTriangle className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Check Discrepancies
            </Button>
          </div>

          {/* Detailed Discrepancies */}
          {(syncHealth as any)?.discrepancy_status?.discrepancies && 
           (syncHealth as any).discrepancy_status.discrepancies.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Discrepancy Details:</h4>
              <div className="bg-muted p-3 rounded-lg text-xs space-y-1 max-h-40 overflow-y-auto">
                {(syncHealth as any).discrepancy_status.discrepancies.slice(0, 10).map((discrepancy: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{discrepancy.player_name}</span>
                    <span className="text-muted-foreground">
                      Goals: {discrepancy.stored_goals}→{discrepancy.actual_goals} | 
                      Assists: {discrepancy.stored_assists}→{discrepancy.actual_assists}
                    </span>
                  </div>
                ))}
                {(syncHealth as any).discrepancy_status.discrepancies.length > 10 && (
                  <div className="text-center text-muted-foreground">
                    ... and {(syncHealth as any).discrepancy_status.discrepancies.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};