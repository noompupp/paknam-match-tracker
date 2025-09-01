import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Database, Clock } from 'lucide-react';
import { SyncHealthIndicator } from './SyncHealthIndicator';
import { useEnhancedSync } from '@/hooks/useEnhancedSync';
import { useDataSynchronization } from '@/hooks/useDataSynchronization';

export const EnhancedSyncDashboard = () => {
  const { 
    syncHealth,
    recheckHealth,
    performManualSync,
    triggerBackgroundSync,
    isPerformingManualSync,
    isPerformingBackgroundSync,
    checkDiscrepancies,
    isCheckingDiscrepancies,
    discrepancies
  } = useEnhancedSync();

  const {
    performFullSync,
    isSyncing,
    lastSyncResult
  } = useDataSynchronization();

  const handleQuickFix = async () => {
    await performManualSync();
    setTimeout(() => recheckHealth(), 1000);
  };

  const handleDeepSync = async () => {
    await performFullSync();
    setTimeout(() => recheckHealth(), 2000);
  };

  const handleBackgroundSync = async () => {
    await triggerBackgroundSync();
    setTimeout(() => recheckHealth(), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Sync Health Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <SyncHealthIndicator />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              size="sm"
              onClick={handleQuickFix}
              disabled={isPerformingManualSync}
              className="w-full"
            >
              {isPerformingManualSync ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Quick Fix Running...
                </>
              ) : (
                'Quick Fix Data'
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeepSync}
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Deep Sync Running...
                </>
              ) : (
                'Deep Sync All'
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBackgroundSync}
              disabled={isPerformingBackgroundSync}
              className="w-full"
            >
              {isPerformingBackgroundSync ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Background Sync...
                </>
              ) : (
                'Background Sync'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Data Analytics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Overview</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {syncHealth && (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Events:</span>
                  <span className="font-medium">{syncHealth.total_goal_assist_events}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-medium">{syncHealth.total_players_with_stats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issues:</span>
                  <span className={`font-medium ${
                    syncHealth.discrepancy_status.discrepancy_count > 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {syncHealth.discrepancy_status.discrepancy_count}
                  </span>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkDiscrepancies()}
              disabled={isCheckingDiscrepancies}
              className="w-full"
            >
              {isCheckingDiscrepancies ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Issues'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Last Sync Results */}
      {lastSyncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Latest Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className={`font-medium ${lastSyncResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {lastSyncResult.success ? 'Success' : 'Failed'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Players Updated</div>
                  <div className="font-medium">{lastSyncResult.playersUpdated || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duplicates Removed</div>
                  <div className="font-medium">{lastSyncResult.duplicatesRemoved || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Goals/Assists</div>
                  <div className="font-medium">
                    {(lastSyncResult.goalsAdded || 0)} / {(lastSyncResult.assistsAdded || 0)}
                  </div>
                </div>
              </div>
              
              {lastSyncResult.errors && lastSyncResult.errors.length > 0 && (
                <div className="mt-3">
                  <div className="text-red-600 font-medium mb-1">Errors:</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {lastSyncResult.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discrepancy Details */}
      {discrepancies && discrepancies.has_discrepancies && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-destructive">
              Data Discrepancies Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="font-medium">
                Found {discrepancies.discrepancy_count} players with inconsistent data:
              </div>
              <div className="space-y-2">
                {discrepancies.discrepancies?.slice(0, 5).map((discrepancy: any, index: number) => (
                  <div key={index} className="p-2 bg-muted rounded text-xs">
                    <div className="font-medium">{discrepancy.player_name}</div>
                    <div className="text-muted-foreground">
                      Goals: {discrepancy.stored_goals} → {discrepancy.actual_goals} 
                      ({discrepancy.goals_diff > 0 ? '+' : ''}{discrepancy.goals_diff})
                    </div>
                    <div className="text-muted-foreground">
                      Assists: {discrepancy.stored_assists} → {discrepancy.actual_assists}
                      ({discrepancy.assists_diff > 0 ? '+' : ''}{discrepancy.assists_diff})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};