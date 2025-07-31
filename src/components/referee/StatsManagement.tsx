
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle, AlertTriangle, TrendingUp, Calculator, Trash2, Clock, Zap } from "lucide-react";
import { usePlayerStatsSync } from "@/hooks/usePlayerStatsSync";
import { useDataSynchronization } from "@/hooks/useDataSynchronization";
import { usePlayerStatsCache } from "@/hooks/useEnhancedPlayerStats";
import { useSyncStatus, usePeriodicSync } from "@/hooks/useSyncStatus";
import { useToast } from "@/hooks/use-toast";

const StatsManagement = () => {
  const { toast } = useToast();
  const { syncStats, validateStats, isSyncing, isValidating, lastSyncResult } = usePlayerStatsSync();
  const { performFullSync, isSyncing: isFullSyncing, lastSyncResult: fullSyncResult } = useDataSynchronization();
  const { invalidateLeaderboards, forceRefreshLeaderboards } = usePlayerStatsCache();
  const { data: syncStatus, isLoading: isLoadingSyncStatus } = useSyncStatus(true);
  const { isEnabled: isPeriodicSyncEnabled, setIsEnabled: setPeriodicSyncEnabled, lastBackgroundSync } = usePeriodicSync(30);

  const handleManualCacheRefresh = async () => {
    try {
      await forceRefreshLeaderboards();
      toast({
        title: "Cache Refreshed! 🔄",
        description: "Leaderboard data has been refreshed from the database.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh leaderboard cache.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Statistics Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => syncStats()} 
            disabled={isSyncing || isFullSyncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Quick Sync Stats'}
          </Button>

          <Button 
            onClick={() => performFullSync()} 
            disabled={isSyncing || isFullSyncing}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Calculator className={`h-4 w-4 ${isFullSyncing ? 'animate-spin' : ''}`} />
            {isFullSyncing ? 'Computing...' : 'Full Cumulative Sync'}
          </Button>

          <Button 
            onClick={() => validateStats()} 
            disabled={isValidating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'Validating...' : 'Validate Stats'}
          </Button>

          <Button 
            onClick={handleManualCacheRefresh}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache & Refresh
          </Button>
        </div>

        {/* Sync Status Section */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Auto-Sync Status
            </h4>
            <Badge variant={syncStatus?.syncEnabled ? "default" : "secondary"}>
              {isLoadingSyncStatus ? "Loading..." : syncStatus?.syncEnabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          {syncStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Events</p>
                <Badge variant="outline">{syncStatus.totalGoalAssistEvents}</Badge>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Players</p>
                <Badge variant="outline">{syncStatus.totalPlayersWithStats}</Badge>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Last Auto-Sync</p>
                <Badge variant="secondary" className="text-xs">
                  {syncStatus.lastAutoSync 
                    ? new Date(syncStatus.lastAutoSync).toLocaleTimeString() 
                    : "Never"
                  }
                </Badge>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Background Sync</p>
                <div className="flex items-center justify-center gap-2">
                  <Switch
                    checked={isPeriodicSyncEnabled}
                    onCheckedChange={setPeriodicSyncEnabled}
                  />
                  <Clock className="h-3 w-3" />
                </div>
              </div>
            </div>
          )}

          {isPeriodicSyncEnabled && lastBackgroundSync && (
            <p className="text-xs text-muted-foreground text-center">
              Last background sync: {lastBackgroundSync.toLocaleTimeString()}
            </p>
          )}
        </div>

        {(lastSyncResult || fullSyncResult) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Sync Results</h4>
              
              {/* Quick Sync Results */}
              {lastSyncResult && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Quick Sync</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="text-center">
                      <Badge variant="default">
                        Players: {lastSyncResult.playersUpdated}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">
                        Goals: {lastSyncResult.goalsAdded}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">
                        Assists: {lastSyncResult.assistsAdded}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={lastSyncResult.errors.length > 0 ? "destructive" : "secondary"}>
                        Errors: {lastSyncResult.errors.length}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Sync Results */}
              {fullSyncResult && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Full Cumulative Sync</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="text-center">
                      <Badge variant="default">
                        Status: {fullSyncResult.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">
                        Players: {fullSyncResult.playerStatsSync?.playersUpdated || 0}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={fullSyncResult.errors?.length > 0 ? "destructive" : "secondary"}>
                        Errors: {fullSyncResult.errors?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  {fullSyncResult.summary && (
                    <p className="text-xs text-muted-foreground">{fullSyncResult.summary}</p>
                  )}
                </div>
              )}
              
              {(lastSyncResult?.errors.length > 0 || fullSyncResult?.errors?.length > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Sync Warnings:</p>
                      <ul className="text-xs text-red-700 mt-1 space-y-1">
                        {lastSyncResult?.errors.map((error: string, index: number) => (
                          <li key={`quick-${index}`}>• Quick: {error}</li>
                        ))}
                        {fullSyncResult?.errors?.map((error: string, index: number) => (
                          <li key={`full-${index}`}>• Full: {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />
        
        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Auto-Sync:</strong> Database triggers automatically update player stats when match events are added/modified. Shows real-time sync status.</p>
          <p><strong>Background Sync:</strong> Optional periodic sync every 30 minutes to ensure data consistency across all systems.</p>
          <p><strong>Quick Sync:</strong> Updates member statistics based on assigned match events (goals/assists).</p>
          <p><strong>Full Cumulative Sync:</strong> Recalculates ALL season totals from ALL match events using database function - ensures accurate cumulative stats.</p>
          <p><strong>Validate Stats:</strong> Checks consistency between match events and member statistics.</p>
          <p><strong>Clear Cache & Refresh:</strong> Manually clears cached leaderboard data and forces a fresh fetch from the database - use if stats appear outdated.</p>
          <p><strong>✨ New:</strong> Stats now auto-sync whenever goals/assists are added! Manual sync is only needed for data recovery or validation.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsManagement;
